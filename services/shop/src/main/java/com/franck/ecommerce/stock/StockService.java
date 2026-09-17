package com.franck.ecommerce.stock;

import java.util.List;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import com.franck.ecommerce.shop.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockItemRepository stockItemRepository;
    private final ShopService shopService;

    public StockItemResponse create(String managerId, StockItemRequest request) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        var item = StockItem.builder()
                .shopId(shop.getId())
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .price(request.price())
                .quantity(request.quantity())
                .lowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : 5)
                .build();
        return StockItemResponse.from(stockItemRepository.save(item));
    }

    public List<StockItemResponse> findAll(String managerId, boolean lowStockOnly) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        var items = lowStockOnly
                ? stockItemRepository.findLowStockByShopId(shop.getId())
                : stockItemRepository.findByShopId(shop.getId());
        return items.stream().map(StockItemResponse::from).toList();
    }

    public StockItemResponse findById(String managerId, Integer itemId) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        return StockItemResponse.from(fetchOwnedItem(shop.getId(), itemId));
    }

    public StockItemResponse update(String managerId, Integer itemId, StockItemRequest request) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        var item = fetchOwnedItem(shop.getId(), itemId);
        item.setName(request.name());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setPrice(request.price());
        item.setQuantity(request.quantity());
        if (request.lowStockThreshold() != null) {
            item.setLowStockThreshold(request.lowStockThreshold());
        }
        return StockItemResponse.from(stockItemRepository.save(item));
    }

    public StockItemResponse adjustQuantity(String managerId, Integer itemId, StockAdjustmentRequest request) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        var item = fetchOwnedItem(shop.getId(), itemId);
        int newQuantity = item.getQuantity() + request.delta();
        if (newQuantity < 0) {
            throw new BusinessException("Resulting quantity cannot be negative");
        }
        item.setQuantity(newQuantity);
        return StockItemResponse.from(stockItemRepository.save(item));
    }

    public void delete(String managerId, Integer itemId) {
        var shop = shopService.getShopEntityByManagerId(managerId);
        var item = fetchOwnedItem(shop.getId(), itemId);
        stockItemRepository.delete(item);
    }

    StockItem fetchOwnedItem(Integer shopId, Integer itemId) {
        return stockItemRepository.findByIdAndShopId(itemId, shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock item not found with id: " + itemId));
    }
}
