package com.franck.ecommerce.config;

public record AuthenticatedUser(String userId, String email, String role, String customerId) {
}
