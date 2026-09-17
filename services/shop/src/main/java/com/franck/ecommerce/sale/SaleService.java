package com.franck.ecommerce.sale;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.ShopService;
import com.franck.ecommerce.stock.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final StockItemRepository stockItemRepository;
    private final ShopService shopService;

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
}
