package com.franck.ecommerce.sale;

public enum SaleSource {
    // Enregistrée manuellement par la gérante (point de vente en boutique).
    MANUAL,
    // Créée automatiquement à partir d'une commande client du storefront
    // (consommation Kafka du topic "order-topic" — voir OrderIngestionService).
    ONLINE
}
