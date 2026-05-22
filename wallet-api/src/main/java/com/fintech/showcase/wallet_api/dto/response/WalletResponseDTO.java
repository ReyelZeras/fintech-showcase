package com.fintech.showcase.wallet_api.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record WalletResponseDTO(
        UUID id,
        String ownerName,
        BigDecimal balance
) {}