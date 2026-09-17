package com.franck.ecommerce.catalog;

import java.math.BigDecimal;

import com.franck.ecommerce.stock.StockItem;

public record CatalogProductResponse(
        Integer id,
        String name,
        String description,
        double availableQuantity,
        BigDecimal price,
        Integer shopId,
        String shopName,
        String categoryName
) {
    public static CatalogProductResponse from(StockItem item, String shopName) {
        return new CatalogProductResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getQuantity(),
                item.getPrice(),
                item.getShopId(),
                shopName,
                item.getCategory()
        );
    }
}
