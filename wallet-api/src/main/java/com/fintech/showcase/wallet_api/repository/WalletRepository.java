package com.fintech.showcase.wallet_api.repository;

import com.fintech.showcase.wallet_api.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
}