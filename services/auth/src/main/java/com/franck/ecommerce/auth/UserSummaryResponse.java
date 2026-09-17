package com.franck.ecommerce.auth;

import com.franck.ecommerce.user.User;

// Vue allégée d'un User pour les listes admin (pas de champ password, pas de token) —
// distinct de AuthenticationResponse qui porte un JWT et sert au login/register.
public record UserSummaryResponse(
        String id,
        String firstname,
        String lastname,
        String email,
        String role,
        String customerId
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getRole().name(),
                user.getCustomerId()
        );
    }
}
