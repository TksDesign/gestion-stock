package com.franck.ecommerce.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.config.AuthenticatedUser;
import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.sale.SaleResponse;
import com.franck.ecommerce.sale.SaleService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerOrderControllerTest {

    @Mock
    private SaleService saleService;

    private CustomerOrderController controller;

    @BeforeEach
    void setUp() {
        controller = new CustomerOrderController(saleService);
    }

    @Test
    void findMyOrders_withAuthenticatedCustomer_returnsTheirOrders() {
        var user = new AuthenticatedUser("user-1", "paul@kshop.com", "CLIENT", "customer-1");
        when(saleService.findMyOrders("customer-1")).thenReturn(List.of(
                new SaleResponse(1, 1, "Boutique", "REF-1", "ORD-1", null, "customer-1", "Paul", "Client",
                        "paul@kshop.com", java.math.BigDecimal.TEN, List.of(), null)
        ));

        var response = controller.findMyOrders(user);

        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void findMyOrders_withNullUser_throwsBusinessException() {
        assertThatThrownBy(() -> controller.findMyOrders(null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void findMyOrders_withUserWithoutCustomerProfile_throwsBusinessException() {
        var user = new AuthenticatedUser("user-1", "marie@kshop.com", "SHOP_MANAGER", null);

        assertThatThrownBy(() -> controller.findMyOrders(user))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No customer profile");
    }
}
