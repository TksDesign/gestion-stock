package com.franck.ecommerce.stock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private StockItemRepository stockItemRepository;
    @Mock
    private ShopService shopService;

    private StockService service;

    private static final Shop SHOP = Shop.builder().id(1).build();

    @BeforeEach
    void setUp() {
        service = new StockService(stockItemRepository, shopService);
    }

    private static StockItem item(int id, int shopId, int quantity, int lowStockThreshold) {
        return StockItem.builder()
                .id(id).shopId(shopId).name("Item " + id).price(BigDecimal.valueOf(9.99))
                .quantity(quantity).lowStockThreshold(lowStockThreshold)
                .build();
    }

    @Test
    void create_savesItemForManagersShopWithDefaultThresholdWhenNotProvided() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.save(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        var request = new StockItemRequest("Keyboard", "desc", "Tech", BigDecimal.valueOf(49.99), 10, null);

        var response = service.create("manager-1", request);

        assertThat(response.shopId()).isEqualTo(1);
        assertThat(response.lowStockThreshold()).isEqualTo(5);
    }

    @Test
    void create_withExplicitThreshold_usesProvidedValue() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.save(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        var request = new StockItemRequest("Keyboard", "desc", "Tech", BigDecimal.valueOf(49.99), 10, 2);

        var response = service.create("manager-1", request);

        assertThat(response.lowStockThreshold()).isEqualTo(2);
    }

    @Test
    void findAll_withLowStockOnlyFalse_returnsAllItemsForShop() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.findByShopId(1)).thenReturn(List.of(item(1, 1, 10, 5)));

        var result = service.findAll("manager-1", false);

        assertThat(result).hasSize(1);
    }

    @Test
    void findAll_withLowStockOnlyTrue_delegatesToLowStockQuery() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.findLowStockByShopId(1)).thenReturn(List.of(item(1, 1, 2, 5)));

        var result = service.findAll("manager-1", true);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).lowStock()).isTrue();
    }

    @Test
    void findById_withItemOwnedByShop_returnsResponse() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(item(10, 1, 5, 5)));

        var response = service.findById("manager-1", 10);

        assertThat(response.id()).isEqualTo(10);
    }

    @Test
    void findById_withItemNotOwnedByShop_throwsResourceNotFoundException() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("manager-1", 10))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_updatesFieldsAndKeepsExistingThresholdWhenNotProvided() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var existing = item(10, 1, 5, 3);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(existing));
        when(stockItemRepository.save(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));
        var request = new StockItemRequest("New name", "new desc", "Cat", BigDecimal.valueOf(19.99), 8, null);

        var response = service.update("manager-1", 10, request);

        assertThat(response.name()).isEqualTo("New name");
        assertThat(response.quantity()).isEqualTo(8);
        assertThat(response.lowStockThreshold()).isEqualTo(3); // inchangé
    }

    @Test
    void adjustQuantity_withPositiveDelta_increasesQuantity() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var existing = item(10, 1, 5, 3);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(existing));
        when(stockItemRepository.save(any(StockItem.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.adjustQuantity("manager-1", 10, new StockAdjustmentRequest(3, "restock"));

        assertThat(response.quantity()).isEqualTo(8);
    }

    @Test
    void adjustQuantity_withNegativeDeltaExceedingStock_throwsBusinessExceptionAndDoesNotSave() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var existing = item(10, 1, 2, 3);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.adjustQuantity("manager-1", 10, new StockAdjustmentRequest(-5, "sale")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot be negative");

        org.mockito.Mockito.verify(stockItemRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void delete_deletesOwnedItem() {
        when(shopService.getShopEntityByManagerId("manager-1")).thenReturn(SHOP);
        var existing = item(10, 1, 5, 3);
        when(stockItemRepository.findByIdAndShopId(10, 1)).thenReturn(Optional.of(existing));

        service.delete("manager-1", 10);

        verify(stockItemRepository).delete(existing);
    }
}
