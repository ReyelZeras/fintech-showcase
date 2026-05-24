package com.fintech.showcase.wallet_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fintech.showcase.wallet_api.entity.User;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.repository.UserRepository;
import com.fintech.showcase.wallet_api.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository repository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public AuthController(AuthenticationManager authenticationManager, UserRepository repository, TokenService tokenService, PasswordEncoder passwordEncoder, RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public record LoginDTO(String email, String password) {}
    public record RegisterDTO(String fullName, String email, String password, String pixKey) {}
    // CORREÇÃO 1: Adicionado email e pixKey no retorno do token
    public record TokenResponseDTO(String token, String fullName, String email, String pixKey, UUID walletId) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginDTO data) {
        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);

            var user = (User) auth.getPrincipal();
            var token = tokenService.generateToken(user);

            return ResponseEntity.ok(new TokenResponseDTO(token, user.getFullName(), user.getEmail(), user.getPixKey(), user.getWallet().getId()));
        } catch (DisabledException e) {
            // CORREÇÃO 2: Trata o soft delete
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conta desativada ou excluída.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterDTO data) {
        if (this.repository.findByEmail(data.email()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail já cadastrado");
        }

        String encryptedPassword = passwordEncoder.encode(data.password());

        Wallet newWallet = Wallet.builder()
                .id(UUID.randomUUID())
                .ownerName(data.fullName())
                .balance(BigDecimal.ZERO)
                .build();

        User newUser = User.builder()
                .fullName(data.fullName())
                .email(data.email())
                .password(encryptedPassword)
                .pixKey(data.pixKey())
                .wallet(newWallet)
                .build();

        this.repository.save(newUser);

        try {
            ObjectNode jsonNode = objectMapper.createObjectNode();
            jsonNode.put("email", newUser.getEmail());
            jsonNode.put("name", newUser.getFullName());
            rabbitTemplate.convertAndSend("email-queue", jsonNode.toString());
        } catch (Exception e) {
            System.err.println("Erro ao enfileirar email");
        }

        return ResponseEntity.ok().build();
    }
}