package com.franck.ecommerce.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.lang.reflect.Field;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET_KEY =
            "NDI2RDYyNTA2NTUzNjg1NjZENzE3MjczNzUzNjc3NDYxNkU2NDYxNzI2ODZFNjk2NDY1MDA=";

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        Field field = JwtService.class.getDeclaredField("secretKey");
        field.setAccessible(true);
        field.set(jwtService, SECRET_KEY);
    }

    private static SecretKey signInKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));
    }

    private static String buildToken(Map<String, Object> claims, String subject, long expiresInMillis) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiresInMillis))
                .signWith(signInKey())
                .compact();
    }

    @Test
    void extractUsername_returnsTheTokenSubject() {
        var token = buildToken(Map.of(), "marie@kshop.com", 60_000);

        assertThat(jwtService.extractUsername(token)).isEqualTo("marie@kshop.com");
    }

    @Test
    void extractRole_returnsTheRoleClaim() {
        var token = buildToken(Map.of("role", "SHOP_MANAGER"), "marie@kshop.com", 60_000);

        assertThat(jwtService.extractRole(token)).isEqualTo("SHOP_MANAGER");
    }

    @Test
    void extractUserId_returnsTheUserIdClaim() {
        var token = buildToken(Map.of("userId", "user-123"), "marie@kshop.com", 60_000);

        assertThat(jwtService.extractUserId(token)).isEqualTo("user-123");
    }

    @Test
    void extractCustomerId_returnsTheCustomerIdClaim() {
        var token = buildToken(Map.of("customerId", "customer-456"), "paul@kshop.com", 60_000);

        assertThat(jwtService.extractCustomerId(token)).isEqualTo("customer-456");
    }

    @Test
    void isTokenValid_forUnexpiredToken_returnsTrue() {
        var token = buildToken(Map.of(), "marie@kshop.com", 60_000);

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_forExpiredToken_throwsExpiredJwtException() {
        var token = buildToken(Map.of(), "marie@kshop.com", -60_000);

        assertThatThrownBy(() -> jwtService.isTokenValid(token))
                .isInstanceOf(ExpiredJwtException.class);
    }
}
