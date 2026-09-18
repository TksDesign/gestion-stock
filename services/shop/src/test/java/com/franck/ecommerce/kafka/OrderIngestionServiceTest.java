package com.franck.ecommerce.kafka;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.sale.Sale;
import com.franck.ecommerce.sale.SaleRepository;
import com.franck.ecommerce.sale.SaleSource;
import com.franck.ecommerce.stock.StockItem;
import com.franck.ecommerce.stock.StockItemRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderIngestionServiceTest {

    @Mock
    private StockItemRepository stockItemRepository;
    @Mock
    private SaleRepository saleRepository;

    private OrderIngestionService service;

    @BeforeEach
    void setUp() {
        service = new OrderIngestionService(stockItemRepository, saleRepository);
    }

    @Test
    void consumeOrderConfirmation_splitsProductsIntoOneSalePerShop() {
        var itemShop1 = StockItem.builder().id(1).shopId(10).build();
        var itemShop2 = StockItem.builder().id(2).shopId(20).build();
        when(stockItemRepository.findAllByIdInOrderById(List.of(1, 2)))
                .thenReturn(List.of(itemShop1, itemShop2));

        var customer = new Customer("c1", "Paul", "Client", "paul@kshop.com");
        var product1 = new Product(1, "Keyboard", "desc", BigDecimal.valueOf(29.99), 2.0);
        var product2 = new Product(2, "Mouse", "desc", BigDecimal.valueOf(19.99), 1.0);
        var confirmation = new OrderConfirmation("ORD-1", BigDecimal.valueOf(79.97), "CREDIT_CARD", customer,
                List.of(product1, product2));

        service.consumeOrderConfirmation(confirmation);

        var savedSales = ArgumentCaptor.forClass(Sale.class);
        verify(saleRepository, times(2)).save(savedSales.capture());

        var sales = savedSales.getAllValues();
        assertThat(sales).extracting(Sale::getShopId).containsExactlyInAnyOrder(10, 20);
        assertThat(sales).allMatch(s -> s.getSource() == SaleSource.ONLINE);
        assertThat(sales).allMatch(s -> "ORD-1".equals(s.getOrderReference()));
        assertThat(sales).allMatch(s -> "c1".equals(s.getCustomerId()));

        var shop1Sale = sales.stream().filter(s -> s.getShopId() == 10).findFirst().orElseThrow();
        assertThat(shop1Sale.getTotalAmount()).isEqualByComparingTo("59.98");
        assertThat(shop1Sale.getItems()).hasSize(1);

        var shop2Sale = sales.stream().filter(s -> s.getShopId() == 20).findFirst().orElseThrow();
        assertThat(shop2Sale.getTotalAmount()).isEqualByComparingTo("19.99");
    }

    @Test
    void consumeOrderConfirmation_withUnknownProduct_skipsItWithoutFailing() {
        when(stockItemRepository.findAllByIdInOrderById(List.of(999))).thenReturn(List.of());

        var customer = new Customer("c1", "Paul", "Client", "paul@kshop.com");
        var product = new Product(999, "Ghost", "desc", BigDecimal.TEN, 1.0);
        var confirmation = new OrderConfirmation("ORD-2", BigDecimal.TEN, "CREDIT_CARD", customer, List.of(product));

        service.consumeOrderConfirmation(confirmation);

        verify(saleRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void consumeOrderConfirmation_withNullCustomer_leavesCustomerFieldsNull() {
        var item = StockItem.builder().id(1).shopId(10).build();
        when(stockItemRepository.findAllByIdInOrderById(List.of(1))).thenReturn(List.of(item));

        var product = new Product(1, "Keyboard", "desc", BigDecimal.valueOf(29.99), 1.0);
        var confirmation = new OrderConfirmation("ORD-3", BigDecimal.valueOf(29.99), "CREDIT_CARD", null, List.of(product));

        service.consumeOrderConfirmation(confirmation);

        var savedSale = ArgumentCaptor.forClass(Sale.class);
        verify(saleRepository).save(savedSale.capture());
        assertThat(savedSale.getValue().getCustomerId()).isNull();
        assertThat(savedSale.getValue().getCustomerEmail()).isNull();
    }
}
