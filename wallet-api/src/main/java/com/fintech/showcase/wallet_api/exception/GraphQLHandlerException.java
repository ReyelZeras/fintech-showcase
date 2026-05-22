package com.fintech.showcase.wallet_api.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
@Slf4j
public class GraphQLHandlerException {

    @GraphQlExceptionHandler
    public GraphQLError handleRuntimeException(RuntimeException ex, DataFetchingEnvironment env) {
        log.error("Erro de regra de negócio ou runtime interceptado: ", ex);
        return GraphqlErrorBuilder.newError(env)
                .message(ex.getMessage())
                .errorType(ErrorType.BAD_REQUEST)
                .build();
    }

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

    // Captura qualquer exceção genérica/infra que possa vazar, mascarando detalhes internos do servidor por segurança
    @GraphQlExceptionHandler
    public GraphQLError handleAllExceptions(Exception ex, DataFetchingEnvironment env) {
        log.error("Erro interno de infraestrutura não tratado: ", ex);
        return GraphqlErrorBuilder.newError(env)
                .message("Ocorreu um erro interno no servidor ao processar a operação.")
                .errorType(ErrorType.INTERNAL_ERROR)
                .build();
    }
}