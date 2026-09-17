package com.franck.ecommerce.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.franck.ecommerce.handler.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

// Sans ceci, une requête sans token (ou avec un token invalide/expiré) sur une route
// protégée était rejetée par le filtre Spring Security AVANT d'atteindre les
// contrôleurs : le GlobalExceptionHandler (@RestControllerAdvice) ne peut pas
// intercepter ce cas, d'où un corps vide malgré le bon status HTTP.
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Authentification requise pour accéder à cette ressource.")));
    }
}
