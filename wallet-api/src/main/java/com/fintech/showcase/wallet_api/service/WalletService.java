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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository repository;
    private final WalletMapper mapper;
    private final TransactionRepository transactionRepository;


    public WalletResponseDTO createWallet(WalletRequestDTO request) {
        Wallet wallet = Wallet.builder()
                .id(UUID.randomUUID())
                .ownerName(request.ownerName())
                .balance(BigDecimal.ZERO)
                .build();
        return mapper.toResponse(repository.save(wallet));
    }

    public WalletResponseDTO getWallet(UUID id) {
        Wallet wallet = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wallet não encontrada"));
        return mapper.toResponse(wallet);
    }

    @Transactional
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

        // Debita e Credita
        source.setBalance(source.getBalance().subtract(request.amount()));
        destination.setBalance(destination.getBalance().add(request.amount()));

        // Registra histórico
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
    }
}