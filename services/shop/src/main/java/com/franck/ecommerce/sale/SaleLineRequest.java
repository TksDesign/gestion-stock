package com.franck.ecommerce.sale;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaleLineRequest(
        @NotNull(message = "Stock item id is required")
        Integer stockItemId,
        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        Integer quantity
) {}
