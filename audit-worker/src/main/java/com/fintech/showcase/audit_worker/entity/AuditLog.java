package com.fintech.showcase.audit_worker.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private UUID id;
    private UUID transactionId;
    private UUID sourceWalletId;
    private UUID destinationWalletId;
    private BigDecimal amount;
    private LocalDateTime transactionTimestamp;
    private LocalDateTime auditedAt;
}