package com.franck.ecommerce.sale;

import java.math.BigDecimal;

public record SaleItemResponse(
        Integer id,
        Integer stockItemId,
        String stockItemName,
        BigDecimal unitPrice,
        Integer quantity,
        SaleItemStatus status
) {
    public static SaleItemResponse from(SaleItem item) {
        return new SaleItemResponse(
                item.getId(),
                item.getStockItemId(),
                item.getStockItemName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getStatus()
        );
    }
}
