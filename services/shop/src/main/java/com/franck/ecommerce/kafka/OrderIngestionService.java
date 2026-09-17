package com.franck.ecommerce.kafka;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.franck.ecommerce.sale.Sale;
import com.franck.ecommerce.sale.SaleItem;
import com.franck.ecommerce.sale.SaleRepository;
import com.franck.ecommerce.sale.SaleSource;
import com.franck.ecommerce.stock.StockItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Consomme les commandes clients confirmées (order-topic, publié par order-service après
// paiement réussi) pour donner à chaque gérante concernée une visibilité sur "qui a
// commandé quoi" dans sa boutique — sans quoi une commande client décrémentait le stock
// silencieusement, invisible du dashboard/historique de ventes (voir docs/api/shop.md,
// section Points d'attention). Ne décrémente PAS le stock ici : c'est déjà fait de façon
// synchrone par CatalogService.purchase() au moment de la commande.
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderIngestionService {

    private final StockItemRepository stockItemRepository;
    private final SaleRepository saleRepository;

    @KafkaListener(topics = "order-topic")
    @Transactional
    public void consumeOrderConfirmation(OrderConfirmation confirmation) {
        log.info("shop-service consuming order-topic: {}", confirmation.orderReference());

        var productIds = confirmation.products().stream().map(Product::productId).toList();
        var stockItemsById = stockItemRepository.findAllByIdInOrderById(productIds).stream()
                .collect(java.util.stream.Collectors.toMap(com.franck.ecommerce.stock.StockItem::getId, item -> item));

        // Regroupe les lignes de la commande par boutique : un même panier peut contenir
        // des produits de plusieurs gérantes différentes -> une Sale par boutique.
        Map<Integer, List<Product>> productsByShopId = new HashMap<>();
        for (Product product : confirmation.products()) {
            var stockItem = stockItemsById.get(product.productId());
            if (stockItem == null) {
                log.warn("Product {} from order {} is not a known StockItem — skipped", product.productId(), confirmation.orderReference());
                continue;
            }
            productsByShopId.computeIfAbsent(stockItem.getShopId(), k -> new ArrayList<>()).add(product);
        }

        for (var entry : productsByShopId.entrySet()) {
            var shopId = entry.getKey();
            var products = entry.getValue();

            var sale = Sale.builder()
                    .shopId(shopId)
                    .reference("SALE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .orderReference(confirmation.orderReference())
                    .source(SaleSource.ONLINE)
                    .customerId(confirmation.customer() != null ? confirmation.customer().id() : null)
                    .customerFirstname(confirmation.customer() != null ? confirmation.customer().firstname() : null)
                    .customerLastname(confirmation.customer() != null ? confirmation.customer().lastname() : null)
                    .customerEmail(confirmation.customer() != null ? confirmation.customer().email() : null)
                    .items(new ArrayList<>())
                    .build();

            BigDecimal total = BigDecimal.ZERO;
            var lineItems = new ArrayList<SaleItem>();
            for (Product product : products) {
                var lineTotal = product.price().multiply(BigDecimal.valueOf(product.quantity()));
                total = total.add(lineTotal);
                lineItems.add(SaleItem.builder()
                        .sale(sale)
                        .stockItemId(product.productId())
                        .stockItemName(product.name())
                        .unitPrice(product.price())
                        .quantity((int) product.quantity())
                        .build());
            }
            sale.setTotalAmount(total);
            sale.setItems(lineItems);

            saleRepository.save(sale);
            log.info("Created ONLINE sale {} for shop {} from order {}", sale.getReference(), shopId, confirmation.orderReference());
        }
    }
}
