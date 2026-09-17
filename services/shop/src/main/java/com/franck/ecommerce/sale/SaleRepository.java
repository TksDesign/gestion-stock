package com.franck.ecommerce.sale;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, Integer> {
    List<Sale> findByShopIdOrderByCreatedDateDesc(Integer shopId);
    Optional<Sale> findByIdAndShopId(Integer id, Integer shopId);
    long countByShopId(Integer shopId);
}
