package com.fintech.showcase.wallet_api.exception;

import java.time.LocalDateTime;
import java.util.List;

public record RestErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        List<String> details
) {}