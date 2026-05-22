package com.fintech.showcase.wallet_api.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolationException;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class GraphQLHandlerException {

    // Trata erros de regra de negócio disparados no Service (ex: Saldo Insuficiente)
    @GraphQlExceptionHandler
    public GraphQLError handleRuntimeException(RuntimeException ex, DataFetchingEnvironment env) {
        return GraphqlErrorBuilder.newError(env)
                .message(ex.getMessage())
                .errorType(ErrorType.BAD_REQUEST)
                .build();
    }

    // Trata erros de validação do Jakarta Bean Validation (@NotBlank, @Size)
    @GraphQlExceptionHandler
    public GraphQLError handleConstraintViolation(ConstraintViolationException ex, DataFetchingEnvironment env) {
        StringBuilder message = new StringBuilder("Erro de validação: ");
        ex.getConstraintViolations().forEach(violation ->
                message.append(violation.getMessage()).append(". ")
        );

        return GraphqlErrorBuilder.newError(env)
                .message(message.toString().trim())
                .errorType(ErrorType.BAD_REQUEST)
                .build();
    }
}