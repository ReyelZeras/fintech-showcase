package com.fintech.showcase.wallet_api.controller;

import com.fintech.showcase.wallet_api.dto.request.WalletRequestDTO;
import com.fintech.showcase.wallet_api.dto.response.WalletResponseDTO;
import com.fintech.showcase.wallet_api.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import com.fintech.showcase.wallet_api.entity.Transaction;
import com.fintech.showcase.wallet_api.repository.TransactionRepository;
import java.util.List;

import java.math.BigDecimal;
import java.util.UUID;

@Controller
@Validated
@RequiredArgsConstructor
public class WalletGraphQLController {
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;

    @QueryMapping
    public WalletResponseDTO getWallet(@Argument UUID id) {
        return walletService.getWallet(id);
    }

    @MutationMapping
    public WalletResponseDTO createWallet(@Valid @Argument WalletRequestDTO input) {
        return walletService.createWallet(input);
    }

    @SchemaMapping(typeName = "Wallet", field = "transactions")
    public List<Transaction> getTransactions(WalletResponseDTO wallet) {
        return transactionRepository.findByWalletIdOrderByTimestampDesc(wallet.id());
    }

    @QueryMapping
    public java.util.List<WalletResponseDTO> findAllWallets() {
        return walletService.findAllWallets();
    }

    @MutationMapping
    public boolean deleteWallet(@Argument UUID id) {
        return walletService.deleteWallet(id);
    }

    @MutationMapping
    public WalletResponseDTO depositWallet(@Argument UUID walletId, @Argument BigDecimal amount) {
        return walletService.deposit(walletId, amount);
    }
}