package com.franck.ecommerce.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.sale.Sale;
import com.franck.ecommerce.sale.SaleItem;
import com.franck.ecommerce.sale.SaleRepository;
import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopService;
import com.franck.ecommerce.stock.StockItem;
import com.franck.ecommerce.stock.StockItemRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ShopService shopService;
    @Mock
    private StockItemRepository stockItemRepository;
    @Mock
    private SaleRepository saleRepository;

    private DashboardService service;

    private static final Shop SHOP = Shop.builder().id(1).build();

    @BeforeEach
    void setUp() {
        service = new DashboardService(shopService, stockItemRepository, saleRepository);
    }

    @Test
    void getDashboard_aggregatesStockValueLowStockAndRevenue() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var lowStockItem = StockItem.builder().id(1).name("Low").price(BigDecimal.valueOf(10)).quantity(1).lowStockThreshold(5).build();
        var okItem = StockItem.builder().id(2).name("Ok").price(BigDecimal.valueOf(20)).quantity(10).lowStockThreshold(5).build();
        when(stockItemRepository.findByShopId(1)).thenReturn(List.of(lowStockItem, okItem));

        var saleItem1 = SaleItem.builder().stockItemName("Ok").unitPrice(BigDecimal.valueOf(20)).quantity(3).build();
        var saleItem2 = SaleItem.builder().stockItemName("Ok").unitPrice(BigDecimal.valueOf(20)).quantity(2).build();
        var sale = Sale.builder().totalAmount(BigDecimal.valueOf(100)).items(List.of(saleItem1, saleItem2)).build();
        when(saleRepository.findByShopIdOrderByCreatedDateDesc(1)).thenReturn(List.of(sale));

        var dashboard = service.getDashboard("manager-1");

        assertThat(dashboard.totalStockItems()).isEqualTo(2);
        assertThat(dashboard.lowStockItemsCount()).isEqualTo(1);
        assertThat(dashboard.totalStockValue()).isEqualByComparingTo("210"); // 10*1 + 20*10
        assertThat(dashboard.totalSalesCount()).isEqualTo(1);
        assertThat(dashboard.totalRevenue()).isEqualByComparingTo("100");
        assertThat(dashboard.topSellingItems()).hasSize(1);
        assertThat(dashboard.topSellingItems().get(0).name()).isEqualTo("Ok");
        assertThat(dashboard.topSellingItems().get(0).quantitySold()).isEqualTo(5);
        assertThat(dashboard.topSellingItems().get(0).revenue()).isEqualByComparingTo("100"); // 20*3 + 20*2
        assertThat(dashboard.lowStockItems()).hasSize(1);
        assertThat(dashboard.lowStockItems().get(0).name()).isEqualTo("Low");
    }

    @Test
    void getDashboard_withNoStockAndNoSales_returnsZeroedResponse() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.findByShopId(1)).thenReturn(List.of());
        when(saleRepository.findByShopIdOrderByCreatedDateDesc(1)).thenReturn(List.of());

        var dashboard = service.getDashboard("manager-1");

        assertThat(dashboard.totalStockItems()).isZero();
        assertThat(dashboard.totalStockValue()).isEqualByComparingTo("0");
        assertThat(dashboard.totalRevenue()).isEqualByComparingTo("0");
        assertThat(dashboard.topSellingItems()).isEmpty();
        assertThat(dashboard.lowStockItems()).isEmpty();
    }
}
