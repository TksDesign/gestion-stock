package com.franck.ecommerce.shop;

import java.util.List;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;

    public ShopResponse createShop(CreateShopRequest request) {
        if (shopRepository.existsByManagerId(request.managerId())) {
            throw new BusinessException("This manager is already assigned to a shop");
        }
        var shop = Shop.builder()
                .name(request.name())
                .description(request.description())
                .street(request.street())
                .city(request.city())
                .zipCode(request.zipCode())
                .managerId(request.managerId())
                .managerEmail(request.managerEmail())
                .status(ShopStatus.ACTIVE)
                .build();
        return ShopResponse.from(shopRepository.save(shop));
    }

    public List<ShopResponse> findAll() {
        return shopRepository.findAll().stream().map(ShopResponse::from).toList();
    }

    public ShopResponse findById(Integer id) {
        return shopRepository.findById(id)
                .map(ShopResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + id));
    }

    public ShopResponse findByManagerId(String managerId) {
        return shopRepository.findByManagerId(managerId)
                .map(ShopResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("No shop assigned to this manager"));
    }

    public Shop getShopEntityByManagerId(String managerId) {
        return shopRepository.findByManagerId(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("No shop assigned to this manager"));
    }

    // Édition admin : contrairement à updateMyShop, pas de scope par managerId — l'admin
    // peut modifier n'importe quelle boutique, y compris la "boutique par défaut" sans
    // gérante (issue de la migration de l'ancien product-service).
    public ShopResponse updateShopByAdmin(Integer id, ShopRequest request) {
        var shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + id));
        shop.setName(request.name());
        shop.setDescription(request.description());
        shop.setStreet(request.street());
        shop.setCity(request.city());
        shop.setZipCode(request.zipCode());
        return ShopResponse.from(shopRepository.save(shop));
    }

    public ShopResponse updateShopStatus(Integer id, ShopStatus status) {
        var shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + id));
        shop.setStatus(status);
        return ShopResponse.from(shopRepository.save(shop));
    }

    public ShopResponse updateMyShop(String managerId, ShopRequest request) {
        var shop = shopRepository.findByManagerId(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("No shop assigned to this manager"));
        shop.setName(request.name());
        shop.setDescription(request.description());
        shop.setStreet(request.street());
        shop.setCity(request.city());
        shop.setZipCode(request.zipCode());
        return ShopResponse.from(shopRepository.save(shop));
    }

    public ShopResponse assignManager(Integer shopId, String managerId, String managerEmail) {
        if (shopRepository.existsByManagerId(managerId)) {
            throw new BusinessException("This manager is already assigned to a shop");
        }
        var shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + shopId));
        shop.setManagerId(managerId);
        shop.setManagerEmail(managerEmail);
        return ShopResponse.from(shopRepository.save(shop));
    }
}
