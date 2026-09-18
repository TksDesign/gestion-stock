package com.franck.ecommerce.category;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryRepository categoryRepository;

    private CategoryController controller;

    @BeforeEach
    void setUp() {
        controller = new CategoryController(categoryRepository);
    }

    @Test
    void findAll_returnsCategoriesSortedAlphabeticallyByName() {
        when(categoryRepository.findAll()).thenReturn(List.of(
                Category.builder().id(1).name("Vêtements").build(),
                Category.builder().id(2).name("Accessoires").build(),
                Category.builder().id(3).name("Électronique").build()
        ));

        var response = controller.findAll();

        var names = response.getBody().stream().map(CategoryResponse::name).toList();
        assertThat(names).containsExactly("Accessoires", "Vêtements", "Électronique");
    }

    @Test
    void findAll_withNoCategories_returnsEmptyList() {
        when(categoryRepository.findAll()).thenReturn(List.of());

        var response = controller.findAll();

        assertThat(response.getBody()).isEmpty();
    }
}
