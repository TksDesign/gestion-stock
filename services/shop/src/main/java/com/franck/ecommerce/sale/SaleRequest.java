package com.franck.ecommerce.sale;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record SaleRequest(
        @NotEmpty(message = "At least one item is required")
        @Valid
        List<SaleLineRequest> items
) {}
