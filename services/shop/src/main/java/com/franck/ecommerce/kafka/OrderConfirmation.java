package com.franck.ecommerce.kafka;

import java.math.BigDecimal;
import java.util.List;

// Miroir du message publié par order-service sur le topic "order-topic" (voir
// services/order/.../kafka/OrderConfirmation.java). shop-service le consomme pour
// enrichir automatiquement les ventes de chaque boutique concernée avec les infos client
// et un statut de livraison par ligne — voir OrderIngestionService.
public record OrderConfirmation(
        String orderReference,
        BigDecimal totalAmount,
        String paymentMethod,
        Customer customer,
        List<Product> products
) {}
