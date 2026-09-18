package com.franck.ecommerce.payment;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PaymentMapperTest {

    private final PaymentMapper mapper = new PaymentMapper();

    @Test
    void toPayment_withNull_returnsNull() {
        assertThat(mapper.toPayment(null)).isNull();
    }

    @Test
    void toPayment_mapsAllFieldsFromRequest() {
        var customer = new Customer("c1", "Paul", "Client", "paul@kshop.com");
        var request = new PaymentRequest(1, BigDecimal.valueOf(49.99), PaymentMethod.CREDIT_CARD, 7, "ORD-1", customer);

        var payment = mapper.toPayment(request);

        assertThat(payment.getId()).isEqualTo(1);
        assertThat(payment.getAmount()).isEqualByComparingTo("49.99");
        assertThat(payment.getPaymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
        assertThat(payment.getOrderId()).isEqualTo(7);
    }
}
