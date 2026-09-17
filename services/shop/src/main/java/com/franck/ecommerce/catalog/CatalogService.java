package com.franck.ecommerce.catalog;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopRepository;
import com.franck.ecommerce.shop.ShopStatus;
import com.franck.ecommerce.stock.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Catalogue public du storefront : agrège le stock de toutes les boutiques ACTIVE.
// Remplace l'ancien product-service comme source de vérité consommée par order-service
// (voir application.config.product-url dans order-service.yml, repointé vers
// /api/v1/shops/catalog/products).
@Service
@RequiredArgsConstructor
public class CatalogService {

    private final StockItemRepository stockItemRepository;
    private final ShopRepository shopRepository;

    public List<CatalogProductResponse> findAll() {
        var activeShops = shopRepository.findByStatus(ShopStatus.ACTIVE);
        var shopNamesById = activeShops.stream()
                .collect(Collectors.toMap(Shop::getId, Shop::getName));
        var shopIds = activeShops.stream().map(Shop::getId).toList();

        return stockItemRepository.findByShopIdIn(shopIds).stream()
                .map(item -> CatalogProductResponse.from(item, shopNamesById.get(item.getShopId())))
                .toList();
    }

    public CatalogProductResponse findById(Integer id) {
        var item = stockItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID:: " + id));
        var shopName = shopRepository.findById(item.getShopId()).map(Shop::getName).orElse(null);
        return CatalogProductResponse.from(item, shopName);
    }

    @Transactional
    public List<CatalogPurchaseResponse> purchase(List<CatalogPurchaseRequest> request) {
        var productIds = request.stream().map(CatalogPurchaseRequest::productId).toList();
        var storedItems = stockItemRepository.findAllByIdInOrderById(productIds);
        if (productIds.size() != storedItems.size()) {
            throw new CatalogPurchaseException("One or more products does not exist");
        }

        var sortedRequest = request.stream()
                .sorted(Comparator.comparing(CatalogPurchaseRequest::productId))
                .toList();

        var purchased = new ArrayList<CatalogPurchaseResponse>();
        for (int i = 0; i < storedItems.size(); i++) {
            var item = storedItems.get(i);
            var line = sortedRequest.get(i);
            if (item.getQuantity() < line.quantity()) {
                throw new CatalogPurchaseException("Insufficient stock quantity for product with ID:: " + line.productId());
            }
            item.setQuantity((int) (item.getQuantity() - line.quantity()));
            stockItemRepository.save(item);
            purchased.add(new CatalogPurchaseResponse(
                    item.getId(), item.getName(), item.getDescription(), item.getPrice(), line.quantity()
            ));
        }
        return purchased;
    }

    @Transactional
    public void restore(List<CatalogPurchaseRequest> request) {
        var productIds = request.stream().map(CatalogPurchaseRequest::productId).toList();
        var storedItems = stockItemRepository.findAllByIdInOrderById(productIds).stream()
                .collect(Collectors.toMap(item -> item.getId(), item -> item));

        for (CatalogPurchaseRequest line : request) {
            var item = storedItems.get(line.productId());
            if (item == null) {
                continue; // produit supprimé depuis — compensation best-effort, ignorée
            }
            item.setQuantity((int) (item.getQuantity() + line.quantity()));
            stockItemRepository.save(item);
        }
    }
}
