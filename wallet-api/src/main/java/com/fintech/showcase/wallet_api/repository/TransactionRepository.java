package com.fintech.showcase.wallet_api.repository;

import com.fintech.showcase.wallet_api.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    // Traz o histórico ordenado do mais recente para o mais antigo
    List<Transaction> findByWalletIdOrderByTimestampDesc(UUID walletId);
}