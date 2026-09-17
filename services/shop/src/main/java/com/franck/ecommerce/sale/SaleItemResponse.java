package com.franck.ecommerce.sale;

import java.math.BigDecimal;

public record SaleItemResponse(
        Integer stockItemId,
        String stockItemName,
        BigDecimal unitPrice,
        Integer quantity
) {
    public static SaleItemResponse from(SaleItem item) {
        return new SaleItemResponse(
                item.getStockItemId(),
                item.getStockItemName(),
                item.getUnitPrice(),
                item.getQuantity()
        );
    }
}
