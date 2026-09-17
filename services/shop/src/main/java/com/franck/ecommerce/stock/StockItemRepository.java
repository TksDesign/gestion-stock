package com.franck.ecommerce.stock;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockItemRepository extends JpaRepository<StockItem, Integer> {

    List<StockItem> findByShopId(Integer shopId);

    Optional<StockItem> findByIdAndShopId(Integer id, Integer shopId);

    @Query("select s from StockItem s where s.shopId = :shopId and s.quantity <= s.lowStockThreshold")
    List<StockItem> findLowStockByShopId(@Param("shopId") Integer shopId);

    long countByShopId(Integer shopId);
}
