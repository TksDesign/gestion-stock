package com.franck.ecommerce.payment;

import com.franck.ecommerce.customer.CustomerResponse;
import com.franck.ecommerce.order.PaymentMethod;

import java.math.BigDecimal;

public record PaymentRequest(
    BigDecimal amount,
    PaymentMethod paymentMethod,
    Integer orderId,
    String orderReference,
    CustomerResponse customer
) {
}
