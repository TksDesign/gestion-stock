package com.franck.ecommerce.sale;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.Shop;
import com.franck.ecommerce.shop.ShopRepository;
import com.franck.ecommerce.shop.ShopService;
import com.franck.ecommerce.stock.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final StockItemRepository stockItemRepository;
    private final ShopService shopService;
    private final ShopRepository shopRepository;

    @Transactional
    public SaleResponse recordSale(String managerId, SaleRequest request) {
        var shop = shopService.getShopEntityByManagerId(managerId);

        var sale = Sale.builder()
                .shopId(shop.getId())
                .reference("SALE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        var lineItems = new ArrayList<SaleItem>();

        for (var line : request.items()) {
            var stockItem = stockItemRepository.findByIdAndShopId(line.stockItemId(), shop.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Stock item not found with id: " + line.stockItemId()));

            if (stockItem.getQuantity() < line.quantity()) {
                throw new BusinessException(
                        "Insufficient stock for item '" + stockItem.getName() + "': available "
                                + stockItem.getQuantity() + ", requested " + line.quantity());
            }

            stockItem.setQuantity(stockItem.getQuantity() - line.quantity());
            stockItemRepository.save(stockItem);

            var lineTotal = stockItem.getPrice().multiply(BigDecimal.valueOf(line.quantity()));
            total = total.add(lineTotal);

            lineItems.add(SaleItem.builder()
                    .sale(sale)
                    .stockItemId(stockItem.getId())
                    .stockItemName(stockItem.getName())
                    .unitPrice(stockItem.getPrice())
                    .quantity(line.quantity())
                    .build());
        }

        sale.setTotalAmount(total);
        sale.setItems(lineItems);

        return SaleResponse.from(saleRepository.save(sale));
    }

    public List<SaleResponse> findAll(String managerId) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        return saleRepository.findByShopIdOrderByCreatedDateDesc(shop.getId())
                .stream().map(SaleResponse::from).toList();
    }

    public SaleResponse findById(String managerId, Integer saleId) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        return saleRepository.findByIdAndShopId(saleId, shop.getId())
                .map(SaleResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + saleId));
    }

    // Fait avancer le statut d'UNE ligne (produit) d'une vente de sa propre boutique —
    // jamais la vente entière, un panier client pouvant mélanger plusieurs boutiques.
    @Transactional
    public SaleItemResponse updateItemStatus(String managerId, Integer saleId, Integer itemId, SaleItemStatusUpdateRequest request) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        var item = saleItemRepository.findByIdAndSale_ShopId(itemId, shop.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale item not found with id: " + itemId));
        if (!item.getSale().getId().equals(saleId)) {
            throw new ResourceNotFoundException("Sale item not found with id: " + itemId);
        }
        item.setStatus(request.status());
        return SaleItemResponse.from(saleItemRepository.save(item));
    }

    // Suivi côté client : toutes ses commandes en ligne (une Sale par boutique
    // concernée), tous shopId confondus — utilisé par GET /shops/catalog/orders/mine.
    // Résout aussi shopName (regroupé en un seul appel) : nécessaire côté frontend pour
    // regrouper plusieurs Sale d'une même commande (orderReference) sans appel réseau
    // supplémentaire par boutique.
    public List<SaleResponse> findMyOrders(String customerId) {
        var sales = saleRepository.findByCustomerIdAndSourceOrderByCreatedDateDesc(customerId, SaleSource.ONLINE);
        var shopIds = sales.stream().map(Sale::getShopId).distinct().toList();
        var shopNamesById = shopRepository.findAllById(shopIds).stream()
                .collect(java.util.stream.Collectors.toMap(Shop::getId, Shop::getName));
        return sales.stream()
                .map(sale -> SaleResponse.from(sale, shopNamesById.get(sale.getShopId())))
                .toList();
    }
}
