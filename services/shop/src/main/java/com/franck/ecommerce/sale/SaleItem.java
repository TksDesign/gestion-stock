package com.franck.ecommerce.sale;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "sale_item")
public class SaleItem {

    @Id
    @GeneratedValue
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;

    private Integer stockItemId;
    private String stockItemName;
    private BigDecimal unitPrice;
    private Integer quantity;

    // Statut de livraison par ligne (et non par commande entière) : un panier peut
    // mélanger des produits de plusieurs boutiques, chaque gérante ne fait avancer
    // que le statut de ses propres lignes. Sans objet pour une vente MANUAL (reste
    // à CONFIRMED, la vente en boutique est immédiate).
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleItemStatus status = SaleItemStatus.CONFIRMED;
}
