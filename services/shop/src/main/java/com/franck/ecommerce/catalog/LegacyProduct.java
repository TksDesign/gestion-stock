package com.franck.ecommerce.catalog;

import java.math.BigDecimal;

// Forme de l'ancien product-service ProductResponse — utilisé uniquement pour désérialiser
// la réponse GET /api/v1/products lors de la migration ponctuelle au démarrage.
public record LegacyProduct(
        Integer id,
        String name,
        String description,
        double availableQuantity,
        BigDecimal price,
        Integer categoryId,
        String categoryName,
        String categoryDescription
) {}
