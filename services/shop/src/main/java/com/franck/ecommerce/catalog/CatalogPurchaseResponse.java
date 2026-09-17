package com.franck.ecommerce.catalog;

import java.math.BigDecimal;

public record CatalogPurchaseResponse(
        Integer productId,
        String name,
        String description,
        BigDecimal price,
        double quantity
) {}
