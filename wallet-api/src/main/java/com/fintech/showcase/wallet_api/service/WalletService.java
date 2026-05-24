package com.fintech.showcase.wallet_api.service;

import com.fintech.showcase.wallet_api.dto.request.TransferRequestDTO;
import com.fintech.showcase.wallet_api.dto.request.WalletRequestDTO;
import com.fintech.showcase.wallet_api.dto.response.WalletResponseDTO;
import com.fintech.showcase.wallet_api.entity.Transaction;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.mapper.WalletMapper;
import com.fintech.showcase.wallet_api.repository.TransactionRepository;
import com.fintech.showcase.wallet_api.repository.WalletRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import com.fintech.showcase.wallet_api.event.TransactionEvent;
import org.springframework.kafka.core.KafkaTemplate;
import com.fintech.showcase.wallet_api.entity.User;
import com.fintech.showcase.wallet_api.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository repository;
    private final WalletMapper mapper;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate; // Injetado automaticamente pelo Lombok

    // value: nome do cache | key: id da carteira usado como identificador único no Redis
    @Cacheable(value = "wallets", key = "#id")
    public WalletResponseDTO getWallet(UUID id) {
        // Para testarmos se o cache funciona, vamos colocar um log.
        // Se o dado vier do Redis, este log NÃO vai aparecer no terminal.
        System.out.println("===> BUSCANDO NO BANCO DE DADOS POSTGRES: " + id);

        Wallet wallet = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wallet não encontrada"));
        return mapper.toResponse(wallet);
    }

    @Transactional
    @CacheEvict(value = "wallets", allEntries = true)
    public void transfer(TransferRequestDTO request) {

        Wallet source = repository.findById(request.sourceWalletId())
                .orElseThrow(() -> new RuntimeException("Carteira de origem não encontrada"));

        // Busca o usuário pela chave PIX e pega a carteira dele
        User destUser = userRepository.findByPixKey(request.pixKey())
                .orElseThrow(() -> new RuntimeException("Chave Pix de destino não encontrada no sistema."));
        Wallet destination = destUser.getWallet();

        if (source.getId().equals(destination.getId())) {
            throw new IllegalArgumentException("Origem e destino não podem ser iguais");
        }

        if (source.getBalance().compareTo(request.amount()) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }

        source.setBalance(source.getBalance().subtract(request.amount()));
        destination.setBalance(destination.getBalance().add(request.amount()));

        Transaction sourceTx = Transaction.builder()
                .id(UUID.randomUUID())
                .wallet(source)
                .type(Transaction.TransactionType.DEBIT)
                .amount(request.amount())
                .timestamp(LocalDateTime.now())
                .build();

        Transaction destTx = Transaction.builder()
                .id(UUID.randomUUID())
                .wallet(destination)
                .type(Transaction.TransactionType.CREDIT)
                .amount(request.amount())
                .timestamp(LocalDateTime.now())
                .build();

        transactionRepository.save(sourceTx);
        transactionRepository.save(destTx);

        // Dispara auditoria Kafka
        TransactionEvent event = new TransactionEvent(
                sourceTx.getId(),
                source.getId(),
                destination.getId(),
                request.amount(),
                sourceTx.getTimestamp()
        );
        kafkaTemplate.send("audit-events", source.getId().toString(), event);
    }

    // Opcional: Limpar cache ao criar uma carteira (não obrigatório, mas boa prática)
    public WalletResponseDTO createWallet(com.fintech.showcase.wallet_api.dto.request.WalletRequestDTO request) {
        Wallet wallet = Wallet.builder()
                .id(UUID.randomUUID())
                .ownerName(request.ownerName())
                .balance(java.math.BigDecimal.ZERO)
                .build();
        return mapper.toResponse(repository.save(wallet));
    }

    public List<WalletResponseDTO> findAllWallets() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "wallets", key = "#id")
    public boolean deleteWallet(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: Carteira não encontrada com o ID fornecido.");
        }
        repository.deleteById(id);
        return true;
    }

    @Transactional
    @CacheEvict(value = "wallets", key = "#walletId")
    public WalletResponseDTO deposit(UUID walletId, BigDecimal amount) {
        // 1. Validação explícita de valor de entrada
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do depósito deve ser maior que zero.");
        }

        // 2. Busca a carteira alvo no banco de dados (PostgreSQL)
        Wallet wallet = repository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada com o ID fornecido."));

        // 3. Atualiza o saldo e a data de modificação
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        repository.save(wallet);

        // 4. Registra no histórico de transações como CREDIT
        Transaction transaction = Transaction.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .type(Transaction.TransactionType.CREDIT)
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);

        System.out.println("===> DEPÓSITO REALIZADO COM SUCESSO. CACHE DA CARTEIRA " + walletId + " EVACUADO!");

        // 5. Dispara o evento assíncrono de auditoria para o Apache Kafka
        TransactionEvent auditEvent = new TransactionEvent(
                transaction.getId(),
                null, // Sem carteira de origem (Depósito externo / Carga)
                wallet.getId(),
                amount,
                LocalDateTime.now()
        );

        try {
            kafkaTemplate.send("audit-events", auditEvent);
            System.out.println("===> EVENTO DE AUDITORIA DE DEPÓSITO DISPARADO COM SUCESSO!");
        } catch (Exception e) {
            // Loga o erro de infraestrutura sem estornar a transação principal se preferir assincronismo resiliente
            System.err.println("ERRO ao disparar evento de auditoria para o Kafka: " + e.getMessage());
        }

        return mapper.toResponse(wallet);
    }
}