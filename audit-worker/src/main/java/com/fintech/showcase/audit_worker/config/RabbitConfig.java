package com.fintech.showcase.audit_worker.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    @Bean
    public Queue emailQueue() {
        return new Queue("email-queue", true); // true = fila durável (não some se o rabbitmq reiniciar)
    }
}