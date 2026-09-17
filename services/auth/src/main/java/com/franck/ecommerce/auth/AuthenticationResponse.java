package com.franck.ecommerce.auth;

public record AuthenticationResponse(
        String token,
        String userId,
        String customerId,
        String firstname,
        String lastname,
        String email,
        String role
) {}
