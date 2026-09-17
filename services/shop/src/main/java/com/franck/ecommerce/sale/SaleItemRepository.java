package com.franck.ecommerce.sale;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleItemRepository extends JpaRepository<SaleItem, Integer> {
    Optional<SaleItem> findByIdAndSale_ShopId(Integer id, Integer shopId);
}
