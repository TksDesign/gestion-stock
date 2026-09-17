package com.franck.ecommerce.sale;

import jakarta.validation.constraints.NotNull;

public record SaleItemStatusUpdateRequest(
        @NotNull(message = "Status is required")
        SaleItemStatus status
) {}
