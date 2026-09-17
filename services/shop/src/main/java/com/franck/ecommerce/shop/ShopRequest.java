package com.franck.ecommerce.shop;

import jakarta.validation.constraints.NotBlank;

public record ShopRequest(
        @NotBlank(message = "Shop name is required")
        String name,
        String description,
        String street,
        String city,
        String zipCode
) {}
