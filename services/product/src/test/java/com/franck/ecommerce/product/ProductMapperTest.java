package com.franck.ecommerce.product;

import static org.assertj.core.api.Assertions.assertThat;

import com.franck.ecommerce.category.Category;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class ProductMapperTest {

    private final ProductMapper mapper = new ProductMapper();

    @Test
    void toProduct_mapsRequestFieldsAndWrapsCategoryId() {
        var request = new ProductRequest(1, "Keyboard", "Mechanical", 10.0, BigDecimal.valueOf(99.99), 5);

        var product = mapper.toProduct(request);

        assertThat(product.getId()).isEqualTo(1);
        assertThat(product.getName()).isEqualTo("Keyboard");
        assertThat(product.getDescription()).isEqualTo("Mechanical");
        assertThat(product.getAvailableQuantity()).isEqualTo(10.0);
        assertThat(product.getPrice()).isEqualByComparingTo("99.99");
        assertThat(product.getCategory().getId()).isEqualTo(5);
    }

    @Test
    void toProductResponse_mapsProductAndCategoryFields() {
        var category = Category.builder().id(5).name("Électronique").description("Gadgets").build();
        var product = Product.builder()
                .id(1).name("Keyboard").description("Mechanical")
                .availableQuantity(10.0).price(BigDecimal.valueOf(99.99)).category(category)
                .build();

        var response = mapper.toProductResponse(product);

        assertThat(response.id()).isEqualTo(1);
        assertThat(response.name()).isEqualTo("Keyboard");
        assertThat(response.categoryId()).isEqualTo(5);
        assertThat(response.categoryName()).isEqualTo("Électronique");
        assertThat(response.categoryDescription()).isEqualTo("Gadgets");
    }

    @Test
    void toProductPurchaseResponse_mapsProductAndRequestedQuantity() {
        var product = Product.builder()
                .id(1).name("Keyboard").description("Mechanical").price(BigDecimal.valueOf(99.99))
                .build();

        var response = mapper.toproductPurchaseResponse(product, 3.0);

        assertThat(response.productId()).isEqualTo(1);
        assertThat(response.name()).isEqualTo("Keyboard");
        assertThat(response.quantity()).isEqualTo(3.0);
    }
}
