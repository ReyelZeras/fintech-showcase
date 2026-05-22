package com.fintech.showcase.wallet_api.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionEvent(
        UUID transactionId,
        UUID sourceWalletId,
        UUID destinationWalletId,
        BigDecimal amount,
        LocalDateTime timestamp
) {}