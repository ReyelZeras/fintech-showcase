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

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository repository;
    private final WalletMapper mapper;
    private final TransactionRepository transactionRepository;

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
    @Caching(evict = {
            @CacheEvict(value = "wallets", key = "#request.sourceWalletId()"),
            @CacheEvict(value = "wallets", key = "#request.destinationWalletId()")
    })
    public void transfer(TransferRequestDTO request) {
        if (request.sourceWalletId().equals(request.destinationWalletId())) {
            throw new IllegalArgumentException("Origem e destino não podem ser iguais");
        }

        Wallet source = repository.findById(request.sourceWalletId())
                .orElseThrow(() -> new RuntimeException("Carteira de origem não encontrada"));

        Wallet destination = repository.findById(request.destinationWalletId())
                .orElseThrow(() -> new RuntimeException("Carteira de destino não encontrada"));

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

        repository.save(source);
        repository.save(destination);
        transactionRepository.save(sourceTx);
        transactionRepository.save(destTx);

        System.out.println("===> TRANSFERÊNCIA REALIZADA COM SUCESSO. CACHE EVACUADO!");
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
}