package com.fintech.showcase.wallet_api.service;

import com.fintech.showcase.wallet_api.entity.Transaction;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionLoggerService {
    private final TransactionRepository transactionRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logFailedTransaction(Wallet wallet, BigDecimal amount, String counterpart) {
        Transaction failedTx = Transaction.builder()
                .id(UUID.randomUUID())
                .wallet(wallet)
                .type(Transaction.TransactionType.FAILED)
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .counterpartName(counterpart)
                .build();
        transactionRepository.save(failedTx);
    }
}