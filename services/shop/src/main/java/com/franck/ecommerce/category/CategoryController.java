package com.franck.ecommerce.category;

import java.util.Comparator;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Public (comme /catalog/**) : liste de référence consommée par le formulaire de
// création/édition de stock (gérante) et potentiellement par un futur filtre catalogue
// côté storefront. Voir SecurityConfig pour le matcher permitAll.
@RestController
@RequestMapping("/api/v1/shops/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> findAll() {
        var categories = categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getName))
                .map(CategoryResponse::from)
                .toList();
        return ResponseEntity.ok(categories);
    }
}
