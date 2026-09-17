package com.franck.ecommerce.auth;

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
                .role(Role.CLIENT)
                .customerId(customerId)
                .build();
        userRepository.save(user);

        return buildResponse(user);
    }

    public AuthenticationResponse createShopManager(CreateManagerRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email already in use");
        }

        var user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.SHOP_MANAGER)
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

    // Listing admin : tous les utilisateurs d'un rôle donné, ou tous si role=null.
    // Vue allégée (UserSummaryResponse), jamais de mot de passe ni de token.
    public java.util.List<UserSummaryResponse> findUsers(Role role) {
        var users = role != null ? userRepository.findByRole(role) : userRepository.findAll();
        return users.stream().map(UserSummaryResponse::from).toList();
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
        var extraClaims = new java.util.HashMap<String, Object>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());
        if (user.getCustomerId() != null) {
            extraClaims.put("customerId", user.getCustomerId());
        }
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
