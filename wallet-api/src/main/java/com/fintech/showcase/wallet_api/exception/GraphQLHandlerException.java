package com.fintech.showcase.wallet_api.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GraphQLHandlerException {

    // 1. Trata regras de negócio disparadas intencionalmente
    @GraphQlExceptionHandler
    public GraphQLError handleRuntimeException(RuntimeException ex, DataFetchingEnvironment env) {
        log.error("Regra de negócio violada no GraphQL: ", ex);
        return GraphqlErrorBuilder.newError(env)
                .message(ex.getMessage())
                .errorType(ErrorType.BAD_REQUEST)
                .extensions(Map.of("code", "BUSINESS_RULE_VIOLATION"))
                .build();
    }

    // 2. Trata erros de Bean Validation (@Size, @NotBlank) nos inputs mapeados
    @GraphQlExceptionHandler
    public GraphQLError handleConstraintViolation(ConstraintViolationException ex, DataFetchingEnvironment env) {
        var details = ex.getConstraintViolations().stream()
                .map(violation -> Map.of(
                        "field", violation.getPropertyPath().toString(),
                        "message", violation.getMessage()
                ))
                .collect(Collectors.toList());

        return GraphqlErrorBuilder.newError(env)
                .message("Falha na validação dos dados de entrada.")
                .errorType(ErrorType.BAD_REQUEST)
                .extensions(Map.of(
                        "code", "INVALID_INPUT",
                        "violations", details
                ))
                .build();
    }

    // 3. Captura qualquer erro de infraestrutura genérico ou não mapeado
    @GraphQlExceptionHandler
    public GraphQLError handleAllExceptions(Exception ex, DataFetchingEnvironment env) {
        String message = ex.getMessage();

        // Intercepta o erro de payload vazio ou sintaxe inválida no parser do GraphQL
        if (message != null && (message.contains("Invalid syntax") || message.contains("offending token"))) {
            return GraphqlErrorBuilder.newError(env)
                    .message("O corpo da requisição GraphQL está vazio, malformado ou com sintaxe inválida.")
                    .errorType(ErrorType.BAD_REQUEST)
                    .extensions(Map.of("code", "MALFORMED_GRAPHQL_QUERY"))
                    .build();
        }

        log.error("Erro não tratado na infraestrutura GraphQL: ", ex);
        return GraphqlErrorBuilder.newError(env)
                .message("Ocorreu um erro interno inesperado no servidor.")
                .errorType(ErrorType.INTERNAL_ERROR)
                .build();
    }
}