package com.fintech.showcase.audit_worker.event;

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