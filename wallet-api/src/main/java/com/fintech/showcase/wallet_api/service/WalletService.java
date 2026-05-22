package com.fintech.showcase.wallet_api.service;

import com.fintech.showcase.wallet_api.dto.request.WalletRequestDTO;
import com.fintech.showcase.wallet_api.dto.response.WalletResponseDTO;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.mapper.WalletMapper;
import com.fintech.showcase.wallet_api.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository repository;
    private final WalletMapper mapper;

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
}