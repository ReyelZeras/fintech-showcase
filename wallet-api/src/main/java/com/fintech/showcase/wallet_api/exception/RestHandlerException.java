package com.fintech.showcase.wallet_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class RestHandlerException {

    // 1. Regras de Negócio do Domínio
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<RestErrorResponse> handleRuntimeException(RuntimeException ex) {
        RestErrorResponse response = new RestErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Regra de Negócio Violada",
                ex.getMessage(),
                List.of()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 2. Validação de campos obrigatórios dentro do DTO (@NotNull, etc)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        RestErrorResponse response = new RestErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Erro de Validação de Input",
                "Os dados enviados na requisição estão inválidos.",
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 3. Corpo Vazio ou JSON Malformado/Sintaxe quebrada no REST
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RestErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        String userMessage = "O corpo da requisição (Request Body) é obrigatório e está ausente ou malformado.";

        RestErrorResponse response = new RestErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Corpo da Requisição Inválido",
                userMessage,
                List.of()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 4. Parâmetro de URL com tipo errado (Ex: Enviar texto em vez de UUID válido na URL)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<RestErrorResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        String detail = String.format("O parâmetro '%s' recebeu o valor '%s' que é inválido. Esperado o tipo: %s",
                ex.getName(), ex.getValue(), ex.getRequiredType().getSimpleName());

        RestErrorResponse response = new RestErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Parâmetro de Requisição Inválido",
                "O tipo do dado enviado na URL ou parâmetro não corresponde ao esperado.",
                List.of(detail)
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}