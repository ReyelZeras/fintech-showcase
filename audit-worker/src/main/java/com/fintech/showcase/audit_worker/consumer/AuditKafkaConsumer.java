package com.fintech.showcase.audit_worker.consumer;

import com.fintech.showcase.audit_worker.event.TransactionEvent;
import com.fintech.showcase.audit_worker.entity.AuditLog;
import com.fintech.showcase.audit_worker.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditKafkaConsumer {

    private final AuditLogRepository repository;

    @KafkaListener(topics = "audit-events", groupId = "audit-group")
    public void consume(TransactionEvent event) {
        log.info("===> MENSAGEM RECEBIDA DO KAFKA - Iniciando Auditoria da Transação: {}", event.transactionId());

        try {
            AuditLog auditLog = AuditLog.builder()
                    .id(UUID.randomUUID())
                    .transactionId(event.transactionId())
                    .sourceWalletId(event.sourceWalletId())
                    .destinationWalletId(event.destinationWalletId())
                    .amount(event.amount())
                    .transactionTimestamp(event.timestamp())
                    .auditedAt(LocalDateTime.now())
                    .build();

            repository.save(auditLog);
            log.info("===> SUCESSO: Registro de auditoria persistido no banco para a transação: {}", event.transactionId());
        } catch (Exception e) {
            log.error("ERRO CRÍTICO ao processar e salvar logs de auditoria no banco de dados", e);
        }
    }
}