package com.franck.ecommerce.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class OrderMapperTest {

    private final OrderMapper mapper = new OrderMapper();

    @Test
    void toOrder_withNull_returnsNull() {
        assertThat(mapper.toOrder(null)).isNull();
    }

    @Test
    void toOrder_mapsRequestFieldsToEntity() {
        var request = new OrderRequest(
                1, "ORD-ABC123", BigDecimal.valueOf(99.99), PaymentMethod.CREDIT_CARD, "customer-1", List.of());

        var order = mapper.toOrder(request);

        assertThat(order.getId()).isEqualTo(1);
        assertThat(order.getReference()).isEqualTo("ORD-ABC123");
        assertThat(order.getTotalAmount()).isEqualByComparingTo("99.99");
        assertThat(order.getPaymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
        assertThat(order.getCustomerId()).isEqualTo("customer-1");
    }

    @Test
    void fromOrder_mapsEntityFieldsToResponse() {
        var order = Order.builder()
                .id(1).reference("ORD-ABC123").totalAmount(BigDecimal.valueOf(99.99))
                .paymentMethod(PaymentMethod.PAYPAL).customerId("customer-1")
                .build();

        var response = mapper.fromOrder(order);

        assertThat(response.id()).isEqualTo(1);
        assertThat(response.reference()).isEqualTo("ORD-ABC123");
        assertThat(response.amount()).isEqualByComparingTo("99.99");
        assertThat(response.paymentMethod()).isEqualTo(PaymentMethod.PAYPAL);
        assertThat(response.customerId()).isEqualTo("customer-1");
    }
}
