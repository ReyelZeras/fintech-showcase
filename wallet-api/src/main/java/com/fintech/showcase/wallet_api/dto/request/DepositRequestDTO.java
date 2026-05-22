package com.fintech.showcase.wallet_api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record DepositRequestDTO(
        @NotNull(message = "O ID da carteira é obrigatório")
        UUID walletId,

        @NotNull(message = "O valor do depósito é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor mínimo para depósito é 0.01")
        BigDecimal amount
) {}