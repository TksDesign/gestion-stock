package com.franck.ecommerce.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(
        Integer id,
        Integer shopId,
        String reference,
        BigDecimal totalAmount,
        List<SaleItemResponse> items,
        LocalDateTime createdDate
) {
    public static SaleResponse from(Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getShopId(),
                sale.getReference(),
                sale.getTotalAmount(),
                sale.getItems() == null ? List.of() : sale.getItems().stream().map(SaleItemResponse::from).toList(),
                sale.getCreatedDate()
        );
    }
}
