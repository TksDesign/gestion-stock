package com.franck.ecommerce.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(
        Integer id,
        Integer shopId,
        String shopName,
        String reference,
        String orderReference,
        SaleSource source,
        String customerId,
        String customerFirstname,
        String customerLastname,
        String customerEmail,
        BigDecimal totalAmount,
        List<SaleItemResponse> items,
        LocalDateTime createdDate
) {
    public static SaleResponse from(Sale sale) {
        return from(sale, null);
    }

    // shopName résolu par l'appelant (SaleService) : utile côté client pour regrouper
    // plusieurs Sale d'une même commande (une par boutique) et distinguer leurs lignes.
    public static SaleResponse from(Sale sale, String shopName) {
        return new SaleResponse(
                sale.getId(),
                sale.getShopId(),
                shopName,
                sale.getReference(),
                sale.getOrderReference(),
                sale.getSource(),
                sale.getCustomerId(),
                sale.getCustomerFirstname(),
                sale.getCustomerLastname(),
                sale.getCustomerEmail(),
                sale.getTotalAmount(),
                sale.getItems() == null ? List.of() : sale.getItems().stream().map(SaleItemResponse::from).toList(),
                sale.getCreatedDate()
        );
    }
}
