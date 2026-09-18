package com.franck.ecommerce.sale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopRepository;
import com.franck.ecommerce.shop.ShopService;
import com.franck.ecommerce.stock.StockItem;
import com.franck.ecommerce.stock.StockItemRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private SaleItemRepository saleItemRepository;
    @Mock
    private StockItemRepository stockItemRepository;
    @Mock
    private ShopService shopService;
    @Mock
    private ShopRepository shopRepository;

    private SaleService service;

    private static final Shop SHOP = Shop.builder().id(1).build();

    @BeforeEach
    void setUp() {
        service = new SaleService(saleRepository, saleItemRepository, stockItemRepository, shopService, shopRepository);
    }

    private static StockItem stockItem(int id, int quantity, String price) {
        return StockItem.builder().id(id).shopId(1).name("Item " + id).price(new BigDecimal(price)).quantity(quantity).build();
    }

    @Test
    void recordSale_withSufficientStock_decrementsStockAndComputesTotal() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var stock = stockItem(10, 5, "9.99");
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(stock));
        when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new SaleRequest(List.of(new SaleLineRequest(10, 2)));
        var response = service.recordSale("manager-1", request);

        assertThat(stock.getQuantity()).isEqualTo(3);
        assertThat(response.totalAmount()).isEqualByComparingTo("19.98");
        assertThat(response.items()).hasSize(1);
        assertThat(response.reference()).startsWith("SALE-");
    }

    @Test
    void recordSale_whenStockItemNotOwnedByShop_throwsResourceNotFoundException() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.empty());

        var request = new SaleRequest(List.of(new SaleLineRequest(10, 2)));

        assertThatThrownBy(() -> service.recordSale("manager-1", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void recordSale_whenInsufficientStock_throwsBusinessExceptionAndDoesNotSaveSale() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var stock = stockItem(10, 1, "9.99");
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(stock));

        var request = new SaleRequest(List.of(new SaleLineRequest(10, 5)));

        assertThatThrownBy(() -> service.recordSale("manager-1", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient stock");

        org.mockito.Mockito.verify(saleRepository, never()).save(any());
    }

    @Test
    void findAll_scopedToManagerShop_returnsMappedSales() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var sale = Sale.builder().id(1).shopId(1).reference("SALE-1").totalAmount(BigDecimal.TEN).items(List.of()).build();
        when(saleRepository.findByShopIdOrderByCreatedDateDesc(1)).thenReturn(List.of(sale));

        var result = service.findAll("manager-1");

        assertThat(result).hasSize(1);
    }

    @Test
    void findById_withSaleOwnedByShop_returnsMappedResponse() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var sale = Sale.builder().id(5).shopId(1).reference("SALE-5").totalAmount(BigDecimal.TEN).items(List.of()).build();
        when(saleRepository.findByIdAndShopId(5, 1)).thenReturn(Optional.of(sale));

        var response = service.findById("manager-1", 5);

        assertThat(response.reference()).isEqualTo("SALE-5");
    }

    @Test
    void findById_withUnknownSale_throwsResourceNotFoundException() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(saleRepository.findByIdAndShopId(999, 1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("manager-1", 999))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateItemStatus_withItemBelongingToSaleAndShop_updatesStatus() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var sale = Sale.builder().id(5).shopId(1).build();
        var item = SaleItem.builder().id(20).sale(sale).status(SaleItemStatus.CONFIRMED).build();
        when(saleItemRepository.findByIdAndSale_ShopId(20, 1)).thenReturn(Optional.of(item));
        when(saleItemRepository.save(any(SaleItem.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.updateItemStatus("manager-1", 5, 20, new SaleItemStatusUpdateRequest(SaleItemStatus.SHIPPED));

        assertThat(response.status()).isEqualTo(SaleItemStatus.SHIPPED);
    }

    @Test
    void updateItemStatus_whenItemBelongsToDifferentSale_throwsResourceNotFoundException() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var sale = Sale.builder().id(999).shopId(1).build(); // saleId different from requested (5)
        var item = SaleItem.builder().id(20).sale(sale).status(SaleItemStatus.CONFIRMED).build();
        when(saleItemRepository.findByIdAndSale_ShopId(20, 1)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> service.updateItemStatus("manager-1", 5, 20, new SaleItemStatusUpdateRequest(SaleItemStatus.SHIPPED)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findMyOrders_resolvesShopNamesForEachSale() {
        var sale1 = Sale.builder().id(1).shopId(1).reference("SALE-1").source(SaleSource.ONLINE)
                .customerId("customer-1").totalAmount(BigDecimal.TEN).items(List.of()).build();
        var sale2 = Sale.builder().id(2).shopId(2).reference("SALE-2").source(SaleSource.ONLINE)
                .customerId("customer-1").totalAmount(BigDecimal.ONE).items(List.of()).build();
        when(saleRepository.findByCustomerIdAndSourceOrderByCreatedDateDesc("customer-1", SaleSource.ONLINE))
                .thenReturn(List.of(sale1, sale2));
        when(shopRepository.findAllById(List.of(1, 2))).thenReturn(List.of(
                Shop.builder().id(1).name("Boutique A").build(),
                Shop.builder().id(2).name("Boutique B").build()
        ));

        var result = service.findMyOrders("customer-1");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).shopName()).isEqualTo("Boutique A");
        assertThat(result.get(1).shopName()).isEqualTo("Boutique B");
    }
}
