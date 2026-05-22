package com.fintech.showcase.wallet_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WalletRequestDTO(
        @NotBlank(message = "O nome do dono é obrigatório")
        @Size(min = 3, message = "O nome deve ter pelo menos 3 caracteres")
        String ownerName
) {}