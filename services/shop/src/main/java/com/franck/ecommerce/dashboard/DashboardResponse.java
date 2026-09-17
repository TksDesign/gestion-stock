package com.franck.ecommerce.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        long totalStockItems,
        int lowStockItemsCount,
        BigDecimal totalStockValue,
        long totalSalesCount,
        BigDecimal totalRevenue,
        List<TopSellingItem> topSellingItems,
        List<LowStockItem> lowStockItems
) {
    public record TopSellingItem(String name, long quantitySold, BigDecimal revenue) {}
    public record LowStockItem(Integer id, String name, Integer quantity, Integer threshold) {}
}
