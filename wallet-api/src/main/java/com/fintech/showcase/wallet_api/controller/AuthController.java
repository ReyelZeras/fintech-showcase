package com.fintech.showcase.wallet_api.controller;

import com.fintech.showcase.wallet_api.entity.User;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.repository.UserRepository;
import com.fintech.showcase.wallet_api.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
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

    public AuthController(AuthenticationManager authenticationManager, UserRepository repository, TokenService tokenService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    public record LoginDTO(String email, String password) {}
    public record RegisterDTO(String fullName, String email, String password, String pixKey) {}
    public record TokenResponseDTO(String token, String fullName, UUID walletId) {}

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var user = (User) auth.getPrincipal();
        var token = tokenService.generateToken(user);

        return ResponseEntity.ok(new TokenResponseDTO(token, user.getFullName(), user.getWallet().getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterDTO data) {
        if (this.repository.findByEmail(data.email()).isPresent()) return ResponseEntity.badRequest().body("E-mail já cadastrado");

        String encryptedPassword = passwordEncoder.encode(data.password());

        // Cria a Wallet automaticamente no momento do cadastro
        Wallet newWallet = Wallet.builder()
                .id(UUID.randomUUID())
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

        return ResponseEntity.ok().build();
    }
}