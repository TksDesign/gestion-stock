package com.franck.ecommerce.catalog;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Catalogue public (aucune authentification) : consommé par le storefront (frontend) et par
// order-service (achat/compensation), au même titre que l'ancien product-service. Chemin
// distinct de /api/v1/shops/mine/** (gérante authentifiée) et /api/v1/shops (admin).
@RestController
@RequestMapping("/api/v1/shops/catalog/products")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping
    public ResponseEntity<List<CatalogProductResponse>> findAll() {
        return ResponseEntity.ok(catalogService.findAll());
    }

    @GetMapping("/{product-id}")
    public ResponseEntity<CatalogProductResponse> findById(@PathVariable("product-id") Integer productId) {
        return ResponseEntity.ok(catalogService.findById(productId));
    }

    @PostMapping("/purchase")
    public ResponseEntity<List<CatalogPurchaseResponse>> purchase(
            @RequestBody @Valid List<CatalogPurchaseRequest> request
    ) {
        return ResponseEntity.ok(catalogService.purchase(request));
    }

    @PostMapping("/restore")
    public ResponseEntity<Void> restore(@RequestBody List<CatalogPurchaseRequest> request) {
        catalogService.restore(request);
        return ResponseEntity.ok().build();
    }
}
