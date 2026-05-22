package com.fintech.showcase.wallet_api.controller;

import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class WalletGraphQLController {
    private final WalletService walletService;

    @QueryMapping
    public Wallet getWallet(@Argument UUID id) {
        return walletService.getWallet(id);
    }

    @MutationMapping
    public Wallet createWallet(@Argument String ownerName) {
        return walletService.createWallet(ownerName);
    }
}