package com.fintech.showcase.audit_worker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditRecord {
    @Id
    private UUID id;
    private String eventType;
    private String payload;
    private LocalDateTime occurredAt;
}