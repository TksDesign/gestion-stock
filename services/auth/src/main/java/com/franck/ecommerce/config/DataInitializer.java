package com.franck.ecommerce.config;

import com.franck.ecommerce.user.Role;
import com.franck.ecommerce.user.User;
import com.franck.ecommerce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@kshop.com")) {
            return;
        }
        var admin = User.builder()
                .firstname("Admin")
                .lastname("KSHOP")
                .email("admin@kshop.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);
        log.info("Default admin user created: admin@kshop.com / admin123");
    }
}
