package com.franck.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;

import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopRepository;
import com.franck.ecommerce.shop.ShopStatus;
import com.franck.ecommerce.stock.StockItem;
import com.franck.ecommerce.stock.StockItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

// Migration ponctuelle et idempotente : au premier démarrage de shop-service, rapatrie les
// produits déjà présents dans l'ancien catalogue (product-service) vers une "boutique par
// défaut" (sans gérante) de shop-service, qui devient désormais la seule source de vérité
// consommée par order-service et le storefront. N'écrase jamais rien si déjà migré
// (vérifie qu'aucun StockItem n'existe encore pour cette boutique).
@Component
@RequiredArgsConstructor
@Slf4j
public class LegacyProductMigrationRunner implements CommandLineRunner {

    public static final String DEFAULT_SHOP_NAME = "Catalogue Général";

    private final ShopRepository shopRepository;
    private final StockItemRepository stockItemRepository;

    // Pointe directement sur product-service (pas via la gateway) : dans start-backend.sh,
    // product-service démarre avant shop-service alors que la gateway démarre en dernier —
    // passer par la gateway ferait échouer systématiquement cette migration au premier lancement.
    @Value("${application.config.legacy-product-url:http://localhost:8050/api/v1/products}")
    private String legacyProductUrl;

    @Override
    public void run(String... args) {
        var defaultShop = shopRepository.findByManagerIdIsNullAndName(DEFAULT_SHOP_NAME)
                .orElseGet(this::createDefaultShop);

        if (stockItemRepository.countByShopId(defaultShop.getId()) > 0) {
            log.info("Legacy product migration already done — skipping (default shop already has {} items)",
                    stockItemRepository.countByShopId(defaultShop.getId()));
            return;
        }

        List<LegacyProduct> legacyProducts;
        try {
            var restTemplate = new RestTemplate();
            ResponseEntity<List<LegacyProduct>> response = restTemplate.exchange(
                    legacyProductUrl, org.springframework.http.HttpMethod.GET, null,
                    new ParameterizedTypeReference<>() {}
            );
            legacyProducts = response.getBody();
        } catch (Exception e) {
            log.warn("Could not reach legacy product-service at {} — migration skipped, will retry on next startup", legacyProductUrl, e);
            return;
        }

        if (legacyProducts == null || legacyProducts.isEmpty()) {
            log.info("No legacy products to migrate");
            return;
        }

        for (LegacyProduct legacy : legacyProducts) {
            var item = StockItem.builder()
                    .shopId(defaultShop.getId())
                    .name(legacy.name())
                    .description(legacy.description())
                    .category(legacy.categoryName())
                    .price(legacy.price() != null ? legacy.price() : BigDecimal.ZERO)
                    .quantity((int) Math.round(legacy.availableQuantity()))
                    .lowStockThreshold(5)
                    .build();
            stockItemRepository.save(item);
        }
        log.info("Migrated {} legacy products into default shop (id={})", legacyProducts.size(), defaultShop.getId());
    }

    private Shop createDefaultShop() {
        var shop = Shop.builder()
                .name(DEFAULT_SHOP_NAME)
                .description("Catalogue général migré depuis l'ancien product-service — non rattaché à une gérante")
                .managerId(null)
                .status(ShopStatus.ACTIVE)
                .build();
        return shopRepository.save(shop);
    }
}
