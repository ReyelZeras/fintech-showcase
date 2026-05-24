package com.fintech.showcase.wallet_api.controller;

import com.fintech.showcase.wallet_api.entity.User;
import com.fintech.showcase.wallet_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // Retorna apenas o nome, sem expor dados sensíveis, para a confirmação do Pix
    @GetMapping("/pix/{pixKey}")
    public ResponseEntity<?> getCounterpartName(@PathVariable String pixKey) {
        return userRepository.findByPixKey(pixKey)
                .map(user -> ResponseEntity.ok(Map.of("fullName", user.getFullName())))
                .orElse(ResponseEntity.notFound().build());
    }

    // Soft Delete (Tela de Perfil)
    @DeleteMapping("/me")
    public ResponseEntity<?> deactivateAccount() {
        User loggedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        loggedUser.setActive(false);
        if (loggedUser.getWallet() != null) {
            loggedUser.getWallet().setActive(false);
        }
        userRepository.save(loggedUser);
        return ResponseEntity.ok().build();
    }

    public record UpdateProfileDTO(String fullName, String pixKey) {}

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileDTO data) {
        User loggedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        loggedUser.setFullName(data.fullName());
        loggedUser.setPixKey(data.pixKey());
        loggedUser.getWallet().setOwnerName(data.fullName());
        userRepository.save(loggedUser);
        return ResponseEntity.ok(Map.of("fullName", loggedUser.getFullName(), "pixKey", loggedUser.getPixKey()));
    }
}