package com.franck.ecommerce.dashboard;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.franck.ecommerce.sale.SaleRepository;
import com.franck.ecommerce.shop.ShopService;
import com.franck.ecommerce.stock.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ShopService shopService;
    private final StockItemRepository stockItemRepository;
    private final SaleRepository saleRepository;

    public DashboardResponse getDashboard(String managerId) {
        var shop = shopService.getShopEntityByManagerId(managerId);

        var stockItems = stockItemRepository.findByShopId(shop.getId());
        var lowStock = stockItems.stream()
                .filter(item -> item.getQuantity() <= item.getLowStockThreshold())
                .toList();

        var totalStockValue = stockItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var sales = saleRepository.findByShopIdOrderByCreatedDateDesc(shop.getId());
        var totalRevenue = sales.stream()
                .map(sale -> sale.getTotalAmount() != null ? sale.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var allSaleItems = sales.stream()
                .flatMap(sale -> sale.getItems() == null ? java.util.stream.Stream.empty() : sale.getItems().stream())
                .toList();

        var topSelling = allSaleItems.stream()
                .collect(Collectors.groupingBy(
                        com.franck.ecommerce.sale.SaleItem::getStockItemName,
                        Collectors.summingLong(item -> item.getQuantity().longValue())
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new DashboardResponse.TopSellingItem(
                        entry.getKey(),
                        entry.getValue(),
                        allSaleItems.stream()
                                .filter(item -> item.getStockItemName().equals(entry.getKey()))
                                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .toList();

        var lowStockDto = lowStock.stream()
                .sorted(Comparator.comparing(item -> item.getQuantity()))
                .map(item -> new DashboardResponse.LowStockItem(
                        item.getId(), item.getName(), item.getQuantity(), item.getLowStockThreshold()))
                .toList();

        return new DashboardResponse(
                stockItems.size(),
                lowStock.size(),
                totalStockValue,
                sales.size(),
                totalRevenue,
                topSelling,
                lowStockDto
        );
    }
}
