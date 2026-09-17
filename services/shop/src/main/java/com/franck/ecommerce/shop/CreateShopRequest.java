package com.franck.ecommerce.shop;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateShopRequest(
        @NotBlank(message = "Shop name is required")
        String name,
        String description,
        String street,
        String city,
        String zipCode,
        @NotBlank(message = "Manager id is required")
        String managerId,
        @Email(message = "Manager email is not valid")
        String managerEmail
) {}
