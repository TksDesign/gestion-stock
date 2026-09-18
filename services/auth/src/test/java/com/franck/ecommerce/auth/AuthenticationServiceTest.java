package com.franck.ecommerce.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.config.JwtService;
import com.franck.ecommerce.user.Role;
import com.franck.ecommerce.user.User;
import com.franck.ecommerce.user.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private CustomerClient customerClient;

    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                userRepository, passwordEncoder, jwtService, authenticationManager, customerClient);
    }

    @Test
    void register_withNewEmail_createsClientAndReturnsToken() {
        var request = new RegisterRequest("Paul", "Client", "paul@kshop.com", "password1");
        when(userRepository.existsByEmail("paul@kshop.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("encoded-password");
        when(customerClient.createCustomer("Paul", "Client", "paul@kshop.com")).thenReturn("customer-42");
        when(jwtService.generateToken(any(User.class), any())).thenReturn("jwt-token");

        var response = authenticationService.register(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("paul@kshop.com");
        assertThat(response.role()).isEqualTo("CLIENT");
        assertThat(response.customerId()).isEqualTo("customer-42");

        var savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getRole()).isEqualTo(Role.CLIENT);
        assertThat(savedUser.getValue().getPassword()).isEqualTo("encoded-password");
        assertThat(savedUser.getValue().getCustomerId()).isEqualTo("customer-42");
    }

    @Test
    void register_whenCustomerServiceUnavailable_stillRegistersWithoutCustomerId() {
        var request = new RegisterRequest("Paul", "Client", "paul@kshop.com", "password1");
        when(userRepository.existsByEmail("paul@kshop.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(customerClient.createCustomer(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("customer-service is down"));
        when(jwtService.generateToken(any(User.class), any())).thenReturn("jwt-token");

        var response = authenticationService.register(request);

        assertThat(response.customerId()).isNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withExistingEmail_throwsIllegalStateExceptionAndDoesNotSave() {
        var request = new RegisterRequest("Paul", "Client", "existing@kshop.com", "password1");
        when(userRepository.existsByEmail("existing@kshop.com")).thenReturn(true);

        assertThatThrownBy(() -> authenticationService.register(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void createShopManager_withNewEmail_createsUserWithShopManagerRole() {
        var request = new CreateManagerRequest("Sophie", "Gerante", "sophie@kshop.com", "password1");
        when(userRepository.existsByEmail("sophie@kshop.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("encoded-password");
        when(jwtService.generateToken(any(User.class), any())).thenReturn("jwt-token");

        var response = authenticationService.createShopManager(request);

        assertThat(response.role()).isEqualTo("SHOP_MANAGER");
        var savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getRole()).isEqualTo(Role.SHOP_MANAGER);
        assertThat(savedUser.getValue().getCustomerId()).isNull();
    }

    @Test
    void createShopManager_withExistingEmail_throwsIllegalStateException() {
        var request = new CreateManagerRequest("Sophie", "Gerante", "existing@kshop.com", "password1");
        when(userRepository.existsByEmail("existing@kshop.com")).thenReturn(true);

        assertThatThrownBy(() -> authenticationService.createShopManager(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Email already in use");
    }

    @Test
    void authenticate_withValidCredentials_returnsTokenForUser() {
        var request = new AuthenticationRequest("marie@kshop.com", "marie123");
        var user = User.builder()
                .id("u1").firstname("Marie").lastname("Dupont")
                .email("marie@kshop.com").role(Role.SHOP_MANAGER).build();
        when(userRepository.findByEmail("marie@kshop.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(User.class), any())).thenReturn("jwt-token");

        var response = authenticationService.authenticate(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.firstname()).isEqualTo("Marie");
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void authenticate_whenUserDisappearsAfterAuthentication_throwsIllegalStateException() {
        var request = new AuthenticationRequest("ghost@kshop.com", "whatever");
        when(userRepository.findByEmail("ghost@kshop.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.authenticate(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("User not found");
    }

    @Test
    void findUsers_withRole_delegatesToFindByRole() {
        var manager = User.builder().id("u1").firstname("Marie").lastname("Dupont")
                .email("marie@kshop.com").role(Role.SHOP_MANAGER).build();
        when(userRepository.findByRole(Role.SHOP_MANAGER)).thenReturn(List.of(manager));

        var result = authenticationService.findUsers(Role.SHOP_MANAGER);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).email()).isEqualTo("marie@kshop.com");
        assertThat(result.get(0).role()).isEqualTo("SHOP_MANAGER");
    }

    @Test
    void findUsers_withNullRole_returnsAllUsers() {
        var user1 = User.builder().id("u1").firstname("A").lastname("A").email("a@kshop.com").role(Role.CLIENT).build();
        var user2 = User.builder().id("u2").firstname("B").lastname("B").email("b@kshop.com").role(Role.ADMIN).build();
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        var result = authenticationService.findUsers(null);

        assertThat(result).hasSize(2);
        verify(userRepository, never()).findByRole(any());
    }

    @Test
    void getCurrentUser_withExistingEmail_returnsUserWithoutToken() {
        var user = User.builder().id("u1").firstname("Admin").lastname("KSHOP")
                .email("admin@kshop.com").role(Role.ADMIN).build();
        when(userRepository.findByEmail("admin@kshop.com")).thenReturn(Optional.of(user));

        var response = authenticationService.getCurrentUser("admin@kshop.com");

        assertThat(response.token()).isNull();
        assertThat(response.email()).isEqualTo("admin@kshop.com");
        assertThat(response.role()).isEqualTo("ADMIN");
    }

    @Test
    void getCurrentUser_withUnknownEmail_throwsIllegalStateException() {
        when(userRepository.findByEmail("unknown@kshop.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.getCurrentUser("unknown@kshop.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("User not found");
    }
}
