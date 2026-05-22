package com.fintech.showcase.wallet_api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record TransferRequestDTO(
        @NotNull(message = "A carteira de origem é obrigatória")
        UUID sourceWalletId,

        @NotNull(message = "A carteira de destino é obrigatória")
        UUID destinationWalletId,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor mínimo para transferência é 0.01")
        BigDecimal amount
) {}