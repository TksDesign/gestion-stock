package com.franck.ecommerce.kafka;

import com.franck.ecommerce.customer.CustomerResponse;
import com.franck.ecommerce.order.PaymentMethod;
import com.franck.ecommerce.product.PurchaseResponse;

import java.math.BigDecimal;
import java.util.List;

public record OrderConfirmation (
        String orderReference,
        BigDecimal totalAmount,
        PaymentMethod paymentMethod,
        CustomerResponse customer,
        List<PurchaseResponse> products

) {
}
