package com.franck.ecommerce.shop;

import java.time.LocalDateTime;

public record ShopResponse(
        Integer id,
        String name,
        String description,
        String street,
        String city,
        String zipCode,
        String managerId,
        String managerEmail,
        ShopStatus status,
        LocalDateTime createdDate
) {
    public static ShopResponse from(Shop shop) {
        return new ShopResponse(
                shop.getId(),
                shop.getName(),
                shop.getDescription(),
                shop.getStreet(),
                shop.getCity(),
                shop.getZipCode(),
                shop.getManagerId(),
                shop.getManagerEmail(),
                shop.getStatus(),
                shop.getCreatedDate()
        );
    }
}
