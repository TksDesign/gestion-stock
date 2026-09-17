package com.franck.ecommerce.sale;

public enum SaleItemStatus {
    // Flux normal (progression linéaire attendue côté frontend, non imposée côté serveur) :
    PENDING,
    CONFIRMED,
    PREPARING,
    SHIPPED,
    DELIVERED,
    // Sorties possibles à tout moment du flux normal :
    CANCELLED,
    EXPIRED
}
