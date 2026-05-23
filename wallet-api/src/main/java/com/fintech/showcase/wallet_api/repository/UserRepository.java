package com.fintech.showcase.wallet_api.repository;

import com.fintech.showcase.wallet_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPixKey(String pixKey);
}