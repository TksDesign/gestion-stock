package com.franck.ecommerce.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.franck.ecommerce.handler.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

// Authentifié mais rôle insuffisant (ex. @PreAuthorize refusé au niveau du filtre plutôt
// que dans le contrôleur) : même raison d'être que RestAuthenticationEntryPoint, pour que
// le corps JSON soit cohérent au lieu d'une réponse 403 vide.
@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                ErrorResponse.of(HttpStatus.FORBIDDEN.value(), "Vous n'avez pas l'autorisation d'effectuer cette action.")));
    }
}
