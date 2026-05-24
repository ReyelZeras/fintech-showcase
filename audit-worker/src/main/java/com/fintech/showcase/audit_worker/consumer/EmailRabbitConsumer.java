package com.fintech.showcase.audit_worker.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailRabbitConsumer {

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "email-queue")
    public void consumeWelcomeEmail(String message) {
        log.info("===> CONSUMINDO MENSAGEM DO RABBITMQ PARA ENVIO DE E-MAIL <===");
        try {
            // Lendo o JSON que foi enviado pela Wallet-API
            JsonNode jsonNode = objectMapper.readTree(message);
            String email = jsonNode.get("email").asText();
            String name = jsonNode.get("name").asText();

            // Montando o E-mail
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("nao-responda@fintechshowcase.com");
            mailMessage.setTo(email);
            mailMessage.setSubject("Bem-vindo(a) à Fintech Showcase, " + name + "!");
            mailMessage.setText(
                    "Olá, " + name + "!\n\n" +
                            "Sua conta foi criada com sucesso.\n" +
                            "Você já pode começar a depositar e transferir dinheiro via Pix para outros usuários do nosso ecossistema.\n\n" +
                            "Um abraço,\nEquipe Fintech Showcase."
            );

            // Disparando o E-mail
            mailSender.send(mailMessage);
            log.info("E-mail de boas-vindas disparado com sucesso para: {}", email);

        } catch (Exception e) {
            log.error("Erro ao tentar enviar o e-mail de boas vindas", e);
        }
    }
}