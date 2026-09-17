package com.franck.ecommerce.stock;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record StockItemRequest(
        @NotBlank(message = "Item name is required")
        String name,
        String description,
        String category,
        @NotNull(message = "Price is required")
        @Positive(message = "Price must be positive")
        BigDecimal price,
        @NotNull(message = "Quantity is required")
        @PositiveOrZero(message = "Quantity cannot be negative")
        Integer quantity,
        Integer lowStockThreshold
) {}
