package com.fintech.showcase.wallet_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.showcase.wallet_api.BaseIntegrationTest;
import com.fintech.showcase.wallet_api.dto.request.TransferRequestDTO;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class TransactionRestControllerIT extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID walletAId;
    private UUID walletBId;

    @BeforeEach
    void seedDatabase() {
        walletRepository.deleteAll();

        walletAId = UUID.randomUUID();
        walletBId = UUID.randomUUID();

        Wallet w1 = Wallet.builder().id(walletAId).ownerName("Alpha").balance(new BigDecimal("500.00")).build();
        Wallet w2 = Wallet.builder().id(walletBId).ownerName("Beta").balance(new BigDecimal("100.00")).build();

        walletRepository.save(w1);
        walletRepository.save(w2);
    }

    @Test
    @DisplayName("POST /api/transactions/transfer -> Deve retornar 200 OK e debitar/creditar valores reais")
    void integratedTransferSuccess() throws Exception {
        TransferRequestDTO body = new TransferRequestDTO(walletAId, walletBId, new BigDecimal("150.00"));

        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());

        Wallet updatedA = walletRepository.findById(walletAId).orElseThrow();
        Wallet updatedB = walletRepository.findById(walletBId).orElseThrow();

        org.assertj.core.api.Assertions.assertThat(updatedA.getBalance()).isEqualByComparingTo("350.00");
        org.assertj.core.api.Assertions.assertThat(updatedB.getBalance()).isEqualByComparingTo("250.00");
    }

    @Test
    @DisplayName("POST /api/transactions/transfer -> Deve retornar 400 Bad Request se falhar na regra de negócio")
    void integratedTransferBusinessError() throws Exception {
        TransferRequestDTO body = new TransferRequestDTO(walletAId, walletBId, new BigDecimal("9999.00"));

        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Regra de Negócio Violada"));
    }
}