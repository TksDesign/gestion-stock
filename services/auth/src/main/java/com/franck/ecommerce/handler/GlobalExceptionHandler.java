package com.franck.ecommerce.handler;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        var errors = new HashMap<String, String>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            var fieldName = ((FieldError) error).getField();
            var message = error.getDefaultMessage();
            errors.put(fieldName, message);
        });
        return ResponseEntity.badRequest().body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), errors));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(HttpStatus.CONFLICT.value(), ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password"));
    }

    // Rôle insuffisant détecté par @PreAuthorize : cette vérification s'exécute via un
    // proxy AOP autour de la méthode du contrôleur, DANS le traitement de la requête par
    // le DispatcherServlet — donc résolue ici, par ce @RestControllerAdvice, et non par
    // le filtre de sécurité (contrairement à un rejet pour absence de token, voir plus bas).
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of(HttpStatus.FORBIDDEN.value(), "Vous n'avez pas l'autorisation d'effectuer cette action."));
    }

    // Note : l'absence de token (401) est rejetée plus tôt dans la chaîne de filtres, avant
    // le DispatcherServlet (ExceptionTranslationFilter) — gérée par RestAuthenticationEntryPoint
    // (package config), câblé dans SecurityConfig, pour renvoyer le même format JSON.

    // Filet de sécurité : toute exception non prévue explicitement (NPE, erreur DB, etc.)
    // renvoyait auparavant la page d'erreur blanche par défaut de Spring Boot au lieu du
    // format JSON attendu par le frontend. La stack trace complète est loguée côté serveur ;
    // seul un message générique (sans détail interne) part au client.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Erreur inattendue dans auth-service", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Une erreur interne est survenue. Veuillez réessayer plus tard."));
    }
}
