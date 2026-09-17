package com.franck.ecommerce.stock;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockItemResponse(
        Integer id,
        Integer shopId,
        String name,
        String description,
        String category,
        BigDecimal price,
        Integer quantity,
        Integer lowStockThreshold,
        boolean lowStock,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate
) {
    public static StockItemResponse from(StockItem item) {
        return new StockItemResponse(
                item.getId(),
                item.getShopId(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getPrice(),
                item.getQuantity(),
                item.getLowStockThreshold(),
                item.getQuantity() <= item.getLowStockThreshold(),
                item.getCreatedDate(),
                item.getLastModifiedDate()
        );
    }
}
