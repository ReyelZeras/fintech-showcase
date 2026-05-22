package com.fintech.showcase.audit_worker.consumer;

import com.fintech.showcase.audit_worker.event.TransactionEvent;
import com.fintech.showcase.audit_worker.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.awaitility.Awaitility;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.kafka.consumer.auto-offset-reset=earliest",
        "spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer",
        "spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer"
})
public class AuditKafkaConsumerIT {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate; // Certifique-se que o tipo do valor está adequado

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    @BeforeEach
    void setUp() {
        // Limpa o banco antes do teste
        auditLogRepository.deleteAll();

        // AJUSTADO: Mudado de 1 para 3 para casar com a arquitetura real do tópico
        for (MessageListenerContainer container : kafkaListenerEndpointRegistry.getListenerContainers()) {
            ContainerTestUtils.waitForAssignment(container, 3);
        }
    }

    @Test
    void shouldConsumeFromKafkaAndPersistInPostgres() {
        // 1. Arrange - Criação do cenário idêntico ao esperado pelo seu Record/JSON DTO
        UUID txId = UUID.randomUUID();
        TransactionEvent event = new TransactionEvent(
                txId,
                UUID.randomUUID(),
                UUID.randomUUID(),
                new BigDecimal("150.00"),
                LocalDateTime.now()
        );

        // 2. Act - O envio agora é seguro pois o container já está ouvindo a partição
        kafkaTemplate.send("audit-events", txId.toString(), event);

        // 3. Assert - Validação assíncrona com Awaitility
        Awaitility.await()
                .atMost(10, TimeUnit.SECONDS)
                .pollInterval(500, TimeUnit.MILLISECONDS)
                .untilAsserted(() -> {
                    var logs = auditLogRepository.findAll();
                    assertThat(logs).isNotEmpty(); // Evita o erro anterior "Expecting actual not to be empty"

                    var persistedLog = logs.stream()
                            .filter(log -> log.getTransactionId().equals(txId))
                            .findFirst();

                    assertThat(persistedLog).isPresent();
                    assertThat(persistedLog.get().getAmount()).isEqualByComparingTo("150.00");
                });
    }
}