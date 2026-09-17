package com.franck.ecommerce.handler;

import com.franck.ecommerce.exception.BusinessException;
import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<ErrorResponse> handle(EntityNotFoundException exp) {
    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(ErrorResponse.of(HttpStatus.NOT_FOUND.value(), exp.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException exp) {
    var errors = new HashMap<String, String>();
    exp.getBindingResult().getAllErrors()
            .forEach(error -> {
              var fieldName = ((FieldError) error).getField();
              var errorMessage = error.getDefaultMessage();
              errors.put(fieldName, errorMessage);
            });

    return ResponseEntity
            .status(BAD_REQUEST)
            .body(ErrorResponse.of(BAD_REQUEST.value(), errors));
  }

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handle(BusinessException exp) {
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), exp.getMsg()));
  }

  /**
   * Erreurs remontées par les appels Feign vers customer-service ou payment-service
   * (ex. client introuvable -> 404). Sans ce handler, ces exceptions non interceptées
   * se traduisaient par un 500 générique côté appelant, quel que soit le vrai statut
   * et le vrai message renvoyés par le service en amont. Bug #3 (majeur) du TEST_REPORT.md.
   * Le corps distant est maintenant lui-même du JSON {errors:{...}} (services alignés sur
   * le même format) : on le repropage tel quel avec le bon Content-Type plutôt que de le
   * re-wrapper, pour ne pas perdre l'information de détail (champ par champ).
   */
  @ExceptionHandler(FeignException.class)
  public ResponseEntity<String> handle(FeignException exp) {
    var status = exp.status() > 0 ? exp.status() : HttpStatus.BAD_GATEWAY.value();
    var body = exp.contentUTF8();
    return ResponseEntity
        .status(status)
        .contentType(looksLikeJson(body) ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN)
        .body(body);
  }

  /**
   * Erreurs remontées par l'appel RestTemplate vers product-service (achat/purchase :
   * produit introuvable, stock insuffisant). Couvre à la fois les 4xx et 5xx renvoyés
   * par product-service (HttpStatusCodeException est la superclasse commune de
   * HttpClientErrorException et HttpServerErrorException). Bug #3 (majeur) du TEST_REPORT.md.
   */
  @ExceptionHandler(HttpStatusCodeException.class)
  public ResponseEntity<String> handle(HttpStatusCodeException exp) {
    var body = exp.getResponseBodyAsString();
    return ResponseEntity
        .status(exp.getStatusCode())
        .contentType(looksLikeJson(body) ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN)
        .body(body);
  }

  private static boolean looksLikeJson(String body) {
    return body != null && body.strip().startsWith("{");
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleUnexpected(Exception exp) {
    log.error("Erreur inattendue dans order-service", exp);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Une erreur interne est survenue. Veuillez réessayer plus tard."));
  }
}
