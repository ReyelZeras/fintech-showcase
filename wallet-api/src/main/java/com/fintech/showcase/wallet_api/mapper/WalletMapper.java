package com.fintech.showcase.wallet_api.mapper;

import com.fintech.showcase.wallet_api.dto.response.WalletResponseDTO;
import com.fintech.showcase.wallet_api.entity.Wallet;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {
    public WalletResponseDTO toResponse(Wallet wallet) {
        return new WalletResponseDTO(
                wallet.getId(),
                wallet.getOwnerName(),
                wallet.getBalance()
        );
    }
}