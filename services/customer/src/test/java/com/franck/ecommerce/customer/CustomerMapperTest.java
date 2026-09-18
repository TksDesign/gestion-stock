package com.franck.ecommerce.customer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CustomerMapperTest {

    private final CustomerMapper mapper = new CustomerMapper();

    @Test
    void toCustomer_withNull_returnsNull() {
        assertThat(mapper.toCustomer(null)).isNull();
    }

    @Test
    void toCustomer_mapsAllFieldsFromRequest() {
        var address = Address.builder().street("Rue de Paris").houseNumber("12").zipCode("75001").build();
        var request = new CustomerRequest("id-1", "Paul", "Client", "paul@kshop.com", address);

        var customer = mapper.toCustomer(request);

        assertThat(customer.getId()).isEqualTo("id-1");
        assertThat(customer.getFirstname()).isEqualTo("Paul");
        assertThat(customer.getLastname()).isEqualTo("Client");
        assertThat(customer.getEmail()).isEqualTo("paul@kshop.com");
        assertThat(customer.getAddress()).isEqualTo(address);
    }

    @Test
    void fromCustomer_withNull_returnsNull() {
        assertThat(mapper.fromCustomer(null)).isNull();
    }

    @Test
    void fromCustomer_mapsAllFieldsToResponse() {
        var address = Address.builder().street("Rue de Paris").houseNumber("12").zipCode("75001").build();
        var customer = Customer.builder()
                .id("id-1").firstname("Paul").lastname("Client").email("paul@kshop.com").address(address)
                .build();

        var response = mapper.fromCustomer(customer);

        assertThat(response.id()).isEqualTo("id-1");
        assertThat(response.firstname()).isEqualTo("Paul");
        assertThat(response.lastname()).isEqualTo("Client");
        assertThat(response.email()).isEqualTo("paul@kshop.com");
        assertThat(response.address()).isEqualTo(address);
    }
}
