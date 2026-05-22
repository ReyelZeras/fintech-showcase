package com.fintech.showcase.audit_worker.service;

import com.fintech.showcase.audit_worker.entity.AuditRecord;
import com.fintech.showcase.audit_worker.repository.AuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository repository;

    public void processEvent(String eventType, String payload) {
        log.info("Processando evento de auditoria: {}", eventType);
        AuditRecord record = AuditRecord.builder()
                .id(UUID.randomUUID())
                .eventType(eventType)
                .payload(payload)
                .occurredAt(LocalDateTime.now())
                .build();
        repository.save(record);
    }
}