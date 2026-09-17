package com.franck.ecommerce.auth;

import java.util.Map;

import com.franck.ecommerce.config.JwtService;
import com.franck.ecommerce.user.Role;
import com.franck.ecommerce.user.User;
import com.franck.ecommerce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomerClient customerClient;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email already in use");
        }

        String customerId = null;
        try {
            customerId = customerClient.createCustomer(
                    request.firstname(), request.lastname(), request.email()
            );
        } catch (Exception e) {
            // Customer service might be down — proceed without customerId
        }

        var user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.SHOP_MANAGER)
                .customerId(customerId)
                .build();
        userRepository.save(user);

        return buildResponse(user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return buildResponse(user);
    }

    public AuthenticationResponse getCurrentUser(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return new AuthenticationResponse(
                null,
                user.getId(),
                user.getCustomerId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private AuthenticationResponse buildResponse(User user) {
        var extraClaims = Map.<String, Object>of(
                "role", user.getRole().name(),
                "userId", user.getId()
        );
        var token = jwtService.generateToken(user, extraClaims);
        return new AuthenticationResponse(
                token,
                user.getId(),
                user.getCustomerId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
