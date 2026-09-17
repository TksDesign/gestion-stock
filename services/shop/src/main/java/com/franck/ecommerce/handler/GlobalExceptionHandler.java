package com.franck.ecommerce.handler;

import java.util.HashMap;

import com.franck.ecommerce.catalog.CatalogPurchaseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 400, pas 409 : réplique exactement le contrat de l'ancien product-service
    // (ProductPurchaseException -> BAD_REQUEST) consommé par order-service.
    @ExceptionHandler(CatalogPurchaseException.class)
    public ResponseEntity<ErrorResponse> handleCatalogPurchase(CatalogPurchaseException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

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

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(HttpStatus.CONFLICT.value(), ex.getMessage()));
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Erreur inattendue dans shop-service", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Une erreur interne est survenue. Veuillez réessayer plus tard."));
    }
}
