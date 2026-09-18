package com.franck.ecommerce.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.category.Category;
import com.franck.ecommerce.exception.ProductPurchaseException;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repository;

    private final ProductMapper mapper = new ProductMapper();

    private ProductService service;

    @BeforeEach
    void setUp() {
        service = new ProductService(repository, mapper);
    }

    private static Product product(int id, double quantity, String price) {
        return Product.builder()
                .id(id).name("Product " + id).description("desc")
                .availableQuantity(quantity).price(new BigDecimal(price))
                .category(Category.builder().id(1).name("Cat").build())
                .build();
    }

    @Test
    void findById_withExistingId_returnsMappedResponse() {
        when(repository.findById(1)).thenReturn(Optional.of(product(1, 10, "9.99")));

        var response = service.findById(1);

        assertThat(response.id()).isEqualTo(1);
        assertThat(response.availableQuantity()).isEqualTo(10);
    }

    @Test
    void findById_withUnknownId_throwsEntityNotFoundException() {
        when(repository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(999))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void findAll_mapsEveryStoredProduct() {
        when(repository.findAll()).thenReturn(List.of(product(1, 10, "9.99"), product(2, 5, "19.99")));

        var result = service.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void purchaseProducts_withSufficientStock_decrementsQuantityForEachProduct() {
        var p1 = product(1, 10, "9.99");
        var p2 = product(2, 5, "19.99");
        when(repository.findAllByIdInOrderById(anyList())).thenReturn(List.of(p1, p2));

        var request = List.of(
                new ProductPurchaseRequest(1, 3.0),
                new ProductPurchaseRequest(2, 2.0)
        );

        var result = service.purchaseProducts(request);

        assertThat(result).hasSize(2);
        assertThat(p1.getAvailableQuantity()).isEqualTo(7.0);
        assertThat(p2.getAvailableQuantity()).isEqualTo(3.0);
        verify(repository, times(2)).save(org.mockito.ArgumentMatchers.any(Product.class));
    }

    @Test
    void purchaseProducts_whenProductDoesNotExist_throwsProductPurchaseException() {
        when(repository.findAllByIdInOrderById(anyList())).thenReturn(List.of()); // 0 trouvé pour 1 demandé

        var request = List.of(new ProductPurchaseRequest(1, 1.0));

        assertThatThrownBy(() -> service.purchaseProducts(request))
                .isInstanceOf(ProductPurchaseException.class)
                .hasMessageContaining("does not exist");

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void purchaseProducts_whenInsufficientStock_throwsProductPurchaseExceptionAndDoesNotSaveThatProduct() {
        var p1 = product(1, 2, "9.99"); // seulement 2 en stock
        when(repository.findAllByIdInOrderById(anyList())).thenReturn(List.of(p1));

        var request = List.of(new ProductPurchaseRequest(1, 5.0));

        assertThatThrownBy(() -> service.purchaseProducts(request))
                .isInstanceOf(ProductPurchaseException.class)
                .hasMessageContaining("Insufficient stock");

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void restoreProducts_incrementsAvailableQuantityForEachProduct() {
        var p1 = product(1, 5, "9.99");
        when(repository.findAllByIdInOrderById(anyList())).thenReturn(List.of(p1));

        service.restoreProducts(List.of(new ProductPurchaseRequest(1, 3.0)));

        assertThat(p1.getAvailableQuantity()).isEqualTo(8.0);
        verify(repository, times(1)).save(p1);
    }

    @Test
    void restoreProducts_whenProductNoLongerExists_skipsItWithoutThrowing() {
        when(repository.findAllByIdInOrderById(anyList())).thenReturn(List.of());

        service.restoreProducts(List.of(new ProductPurchaseRequest(999, 3.0)));

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
