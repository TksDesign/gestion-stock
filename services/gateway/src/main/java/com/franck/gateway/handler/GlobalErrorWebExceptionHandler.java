package com.franck.gateway.handler;

import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Sans ce handler, une panne en aval (service arrêté, injoignable, ou trop lent) se
 * traduisait pour le frontend par un 503/504 générique sans corps exploitable (page
 * d'erreur par défaut de Spring Cloud Gateway) : impossible de distinguer "le serveur a
 * planté" de "le service X est indisponible" ou "le service X met trop de temps à répondre".
 * On uniformise ici sur le même format JSON {timestamp, status, errors:{error}} que les
 * microservices en aval, avec un message qui identifie la nature de la panne.
 *
 * @Order(-2) : s'exécute avant le DefaultErrorWebExceptionHandler de Spring Boot (-1),
 * donc le remplace pour toutes les erreurs non gérées par un filtre plus spécifique.
 */
@Component
@Order(-2)
public class GlobalErrorWebExceptionHandler implements ErrorWebExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalErrorWebExceptionHandler.class);

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();
        if (response.isCommitted()) {
            return Mono.error(ex);
        }

        HttpStatus status;
        String message;

        if (ex instanceof ResponseStatusException rse) {
            status = HttpStatus.resolve(rse.getStatusCode().value());
            if (status == null) {
                status = HttpStatus.SERVICE_UNAVAILABLE;
            }
            message = status == HttpStatus.NOT_FOUND
                    ? "Ressource introuvable."
                    : "Le service demandé est actuellement indisponible. Veuillez réessayer plus tard.";
        } else if (isConnectFailure(ex)) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "Le service demandé est actuellement indisponible. Veuillez réessayer plus tard.";
        } else if (isTimeout(ex)) {
            status = HttpStatus.GATEWAY_TIMEOUT;
            message = "Le service demandé met trop de temps à répondre. Veuillez réessayer plus tard.";
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Une erreur inattendue est survenue. Veuillez réessayer plus tard.";
        }

        if (status.is5xxServerError()) {
            log.error("Erreur gateway ({}) sur {}", status, exchange.getRequest().getPath(), ex);
        }

        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String path = exchange.getRequest().getPath().value().replace("\"", "'");
        String safeMessage = message.replace("\"", "'");
        String body = "{\"timestamp\":\"" + Instant.now() + "\",\"status\":" + status.value()
                + ",\"path\":\"" + path + "\",\"errors\":{\"error\":\"" + safeMessage + "\"}}";

        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    private static boolean isConnectFailure(Throwable ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof ConnectException || cause instanceof java.net.UnknownHostException) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    private static boolean isTimeout(Throwable ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof TimeoutException
                    || cause.getClass().getSimpleName().contains("TimeoutException")) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }
}
