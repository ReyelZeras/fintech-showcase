package com.fintech.showcase.audit_worker.consumer;

import com.fintech.showcase.audit_worker.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditKafkaConsumer {
    private final AuditService auditService;

    @KafkaListener(topics = "audit-events", groupId = "audit-worker-group")
    public void listen(String message) {
        // Exemplo simplificado: assumindo que o payload chega como string JSON
        auditService.processEvent("WALLET_EVENT", message);
    }
}