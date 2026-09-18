package com.franck.ecommerce.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopRepository;
import com.franck.ecommerce.shop.ShopStatus;
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
class CatalogServiceTest {

    @Mock
    private StockItemRepository stockItemRepository;
    @Mock
    private ShopRepository shopRepository;

    private CatalogService service;

    @BeforeEach
    void setUp() {
        service = new CatalogService(stockItemRepository, shopRepository);
    }

    private static StockItem item(int id, int shopId, int quantity) {
        return StockItem.builder().id(id).shopId(shopId).name("Item " + id)
                .price(BigDecimal.valueOf(9.99)).quantity(quantity).build();
    }

    @Test
    void findAll_onlyReturnsItemsFromActiveShops() {
        var activeShop = Shop.builder().id(1).name("Boutique Active").status(ShopStatus.ACTIVE).build();
        when(shopRepository.findByStatus(ShopStatus.ACTIVE)).thenReturn(List.of(activeShop));
        when(stockItemRepository.findByShopIdIn(List.of(1))).thenReturn(List.of(item(1, 1, 10)));

        var result = service.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).shopName()).isEqualTo("Boutique Active");
    }

    @Test
    void findById_withExistingItem_includesShopName() {
        when(stockItemRepository.findById(1)).thenReturn(Optional.of(item(1, 5, 10)));
        when(shopRepository.findById(5)).thenReturn(Optional.of(Shop.builder().id(5).name("Boutique X").build()));

        var response = service.findById(1);

        assertThat(response.shopName()).isEqualTo("Boutique X");
    }

    @Test
    void findById_withUnknownItem_throwsResourceNotFoundException() {
        when(stockItemRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(999))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void purchase_withSufficientStock_decrementsQuantityForEachItem() {
        var i1 = item(1, 1, 10);
        var i2 = item(2, 1, 5);
        when(stockItemRepository.findAllByIdInOrderById(anyList())).thenReturn(List.of(i1, i2));

        var result = service.purchase(List.of(
                new CatalogPurchaseRequest(1, 3.0),
                new CatalogPurchaseRequest(2, 2.0)
        ));

        assertThat(result).hasSize(2);
        assertThat(i1.getQuantity()).isEqualTo(7);
        assertThat(i2.getQuantity()).isEqualTo(3);
        verify(stockItemRepository, times(2)).save(org.mockito.ArgumentMatchers.any(StockItem.class));
    }

    @Test
    void purchase_whenProductDoesNotExist_throwsCatalogPurchaseException() {
        when(stockItemRepository.findAllByIdInOrderById(anyList())).thenReturn(List.of());

        assertThatThrownBy(() -> service.purchase(List.of(new CatalogPurchaseRequest(1, 1.0))))
                .isInstanceOf(CatalogPurchaseException.class)
                .hasMessageContaining("does not exist");
    }

    @Test
    void purchase_whenInsufficientStock_throwsCatalogPurchaseExceptionAndDoesNotSave() {
        var i1 = item(1, 1, 2);
        when(stockItemRepository.findAllByIdInOrderById(anyList())).thenReturn(List.of(i1));

        assertThatThrownBy(() -> service.purchase(List.of(new CatalogPurchaseRequest(1, 5.0))))
                .isInstanceOf(CatalogPurchaseException.class)
                .hasMessageContaining("Insufficient stock");

        verify(stockItemRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void restore_incrementsQuantityForEachItem() {
        var i1 = item(1, 1, 5);
        when(stockItemRepository.findAllByIdInOrderById(anyList())).thenReturn(List.of(i1));

        service.restore(List.of(new CatalogPurchaseRequest(1, 3.0)));

        assertThat(i1.getQuantity()).isEqualTo(8);
    }

    @Test
    void restore_whenItemNoLongerExists_skipsItWithoutThrowing() {
        when(stockItemRepository.findAllByIdInOrderById(anyList())).thenReturn(List.of());

        service.restore(List.of(new CatalogPurchaseRequest(999, 3.0)));

        verify(stockItemRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
