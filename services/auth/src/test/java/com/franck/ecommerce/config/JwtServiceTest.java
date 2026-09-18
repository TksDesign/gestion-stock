package com.franck.ecommerce.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Field;
import java.util.Map;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTest {

    // Clé HMAC-SHA384 valide encodée en base64 (256 bits), uniquement pour les tests.
    private static final String SECRET_KEY =
            "NDI2RDYyNTA2NTUzNjg1NjZENzE3MjczNzUzNjc3NDYxNkU2NDYxNzI2ODZFNjk2NDY1MDA=";

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField(jwtService, "secretKey", SECRET_KEY);
        setField(jwtService, "jwtExpiration", 1000L * 60 * 60); // 1h
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = JwtService.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    private static UserDetails userDetails(String email) {
        return new User(email, "irrelevant", java.util.List.of());
    }

    @Test
    void generateToken_thenExtractUsername_returnsOriginalEmail() {
        var user = userDetails("marie@kshop.com");

        var token = jwtService.generateToken(user);

        assertThat(jwtService.extractUsername(token)).isEqualTo("marie@kshop.com");
    }

    @Test
    void generateToken_withExtraClaims_embedsThemInTheToken() {
        var user = userDetails("admin@kshop.com");
        var extraClaims = Map.<String, Object>of("role", "ADMIN", "userId", "abc123");

        var token = jwtService.generateToken(user, extraClaims);

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        String userId = jwtService.extractClaim(token, claims -> claims.get("userId", String.class));
        assertThat(role).isEqualTo("ADMIN");
        assertThat(userId).isEqualTo("abc123");
    }

    @Test
    void isTokenValid_forMatchingUserAndUnexpiredToken_returnsTrue() {
        var user = userDetails("client@kshop.com");
        var token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_forDifferentUser_returnsFalse() {
        var user = userDetails("client@kshop.com");
        var otherUser = userDetails("someone-else@kshop.com");
        var token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    void isTokenValid_forExpiredToken_throwsExpiredJwtException() throws Exception {
        var user = userDetails("client@kshop.com");
        setField(jwtService, "jwtExpiration", -1000L); // déjà expiré à la génération
        var token = jwtService.generateToken(user);

        // isTokenValid appelle extractExpiration -> extractAllClaims, qui rejette un
        // token expiré : jjwt lève ExpiredJwtException plutôt que de retourner false.
        assertThatThrownBy(() -> jwtService.isTokenValid(token, user))
                .isInstanceOf(ExpiredJwtException.class);
    }
}
