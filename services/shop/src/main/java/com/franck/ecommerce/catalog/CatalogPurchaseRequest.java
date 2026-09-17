package com.franck.ecommerce.catalog;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// Champs volontairement identiques à order-service PurchaseRequest (productId, quantity)
// pour rester un remplaçant direct de l'ancien product-service, sans changement côté order-service.
public record CatalogPurchaseRequest(
        @NotNull(message = "Product is mandatory")
        Integer productId,
        @Positive(message = "Quantity is mandatory")
        double quantity
) {}
