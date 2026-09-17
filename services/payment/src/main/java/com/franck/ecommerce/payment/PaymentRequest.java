package com.franck.ecommerce.payment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PaymentRequest(
    Integer id,
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount should be positive")
    BigDecimal amount,
    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod,
    Integer orderId,
    String orderReference,
    @NotNull(message = "Customer is required")
    @Valid
    Customer customer
) {
}
