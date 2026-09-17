package com.franck.ecommerce.shop;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRepository extends JpaRepository<Shop, Integer> {
    Optional<Shop> findByManagerId(String managerId);
    boolean existsByManagerId(String managerId);
    java.util.List<Shop> findByStatus(ShopStatus status);
    Optional<Shop> findByManagerIdIsNullAndName(String name);
}
