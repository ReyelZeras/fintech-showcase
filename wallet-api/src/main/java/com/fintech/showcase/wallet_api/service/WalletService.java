package com.fintech.showcase.wallet_api.service;

import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository repository;

    public Wallet createWallet(String ownerName) {
        Wallet wallet = Wallet.builder()
                .id(UUID.randomUUID())
                .ownerName(ownerName)
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(wallet);
    }

    public Wallet getWallet(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Wallet not found"));
    }
}