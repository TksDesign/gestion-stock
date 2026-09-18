package com.franck.ecommerce.customer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.exception.CustomerNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository repository;

    private final CustomerMapper mapper = new CustomerMapper();

    private CustomerService service;

    @BeforeEach
    void setUp() {
        service = new CustomerService(repository, mapper);
    }

    @Test
    void createCustomer_savesAndReturnsGeneratedId() {
        var request = new CustomerRequest(null, "Paul", "Client", "paul@kshop.com", null);
        when(repository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            c.setId("generated-id");
            return c;
        });

        var id = service.createCustomer(request);

        assertThat(id).isEqualTo("generated-id");
    }

    @Test
    void updateCustomer_mergesOnlyNonBlankFields() {
        var existing = Customer.builder()
                .id("id-1").firstname("Old").lastname("Name").email("old@kshop.com").build();
        var address = Address.builder().street("Rue X").houseNumber("1").zipCode("75000").build();
        var request = new CustomerRequest("id-1", "New", "", "", address);
        when(repository.findById("id-1")).thenReturn(Optional.of(existing));

        service.updateCustomer(request);

        var saved = ArgumentCaptor.forClass(Customer.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getFirstname()).isEqualTo("New");
        assertThat(saved.getValue().getLastname()).isEqualTo("Name"); // blank -> non modifié
        assertThat(saved.getValue().getEmail()).isEqualTo("old@kshop.com"); // blank -> non modifié
        assertThat(saved.getValue().getAddress()).isEqualTo(address);
    }

    @Test
    void updateCustomer_withUnknownId_throwsCustomerNotFoundExceptionAndDoesNotSave() {
        var request = new CustomerRequest("missing", "New", "Name", "new@kshop.com", null);
        when(repository.findById("missing")).thenReturn(Optional.empty());

        // CustomerNotFoundException ne transmet pas son message à RuntimeException
        // (bug préexistant, non modifié ici) : getMessage() est toujours null, le vrai
        // texte est porté par le champ/getter `msg`.
        var thrown = org.assertj.core.api.Assertions.catchThrowableOfType(
                () -> service.updateCustomer(request), CustomerNotFoundException.class);
        assertThat(thrown).isNotNull();
        assertThat(thrown.getMsg()).contains("missing");

        verify(repository, never()).save(any());
    }

    @Test
    void findAllCustomers_mapsEveryEntityToResponse() {
        var c1 = Customer.builder().id("1").firstname("A").lastname("A").email("a@kshop.com").build();
        var c2 = Customer.builder().id("2").firstname("B").lastname("B").email("b@kshop.com").build();
        when(repository.findAll()).thenReturn(List.of(c1, c2));

        var result = service.findAllCustomers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo("1");
        assertThat(result.get(1).id()).isEqualTo("2");
    }

    @Test
    void findById_withExistingId_returnsMappedResponse() {
        var customer = Customer.builder().id("id-1").firstname("Paul").lastname("Client").email("paul@kshop.com").build();
        when(repository.findById("id-1")).thenReturn(Optional.of(customer));

        var response = service.findById("id-1");

        assertThat(response.firstname()).isEqualTo("Paul");
    }

    @Test
    void findById_withUnknownId_throwsCustomerNotFoundException() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        var thrown = org.assertj.core.api.Assertions.catchThrowableOfType(
                () -> service.findById("missing"), CustomerNotFoundException.class);
        assertThat(thrown).isNotNull();
        assertThat(thrown.getMsg()).contains("missing");
    }

    @Test
    void existsById_whenCustomerPresent_returnsTrue() {
        when(repository.findById("id-1")).thenReturn(Optional.of(Customer.builder().id("id-1").build()));

        assertThat(service.existsById("id-1")).isTrue();
    }

    @Test
    void existsById_whenCustomerAbsent_returnsFalse() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThat(service.existsById("missing")).isFalse();
    }

    @Test
    void deleteCustomer_delegatesToRepository() {
        service.deleteCustomer("id-1");

        verify(repository).deleteById("id-1");
    }
}
