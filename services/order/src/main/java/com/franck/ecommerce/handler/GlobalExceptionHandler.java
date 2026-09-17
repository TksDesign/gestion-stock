package com.franck.ecommerce.handler;

import com.franck.ecommerce.exception.BusinessException;
import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.HashMap;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<String> handle(EntityNotFoundException exp) {
    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(exp.getMessage());
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
            .body(new ErrorResponse(errors));
  }

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<String> handle(BusinessException exp) {
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(exp.getMsg());
  }

  /**
   * Erreurs remontées par les appels Feign vers customer-service ou payment-service
   * (ex. client introuvable -> 404). Sans ce handler, ces exceptions non interceptées
   * se traduisaient par un 500 générique côté appelant, quel que soit le vrai statut
   * et le vrai message renvoyés par le service en amont. Bug #3 (majeur) du TEST_REPORT.md.
   */
  @ExceptionHandler(FeignException.class)
  public ResponseEntity<String> handle(FeignException exp) {
    var status = exp.status() > 0 ? exp.status() : HttpStatus.BAD_GATEWAY.value();
    return ResponseEntity
        .status(status)
        .body(exp.contentUTF8());
  }

  /**
   * Erreurs remontées par l'appel RestTemplate vers product-service (achat/purchase :
   * produit introuvable, stock insuffisant). Couvre à la fois les 4xx et 5xx renvoyés
   * par product-service (HttpStatusCodeException est la superclasse commune de
   * HttpClientErrorException et HttpServerErrorException). Bug #3 (majeur) du TEST_REPORT.md.
   */
  @ExceptionHandler(HttpStatusCodeException.class)
  public ResponseEntity<String> handle(HttpStatusCodeException exp) {
    return ResponseEntity
        .status(exp.getStatusCode())
        .body(exp.getResponseBodyAsString());
  }
}
