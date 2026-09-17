package com.franck.ecommerce.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "sale")
public class Sale {

    @Id
    @GeneratedValue
    private Integer id;

    @Column(nullable = false)
    private Integer shopId;

    @Column(unique = true, nullable = false)
    private String reference;

    private BigDecimal totalAmount;

    // Non nul uniquement pour les ventes ONLINE : trace la commande order-service
    // d'origine (référence "ORD-xxxx"). Volontairement non unique : un même order
    // peut produire plusieurs Sale (une par boutique concernée par le panier).
    private String orderReference;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleSource source = SaleSource.MANUAL;

    // Renseignés uniquement pour les ventes ONLINE (issues d'une commande client) —
    // permet à la gérante de voir qui a commandé sans appel réseau à customer-service.
    private String customerId;
    private String customerFirstname;
    private String customerLastname;
    private String customerEmail;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdDate;
}
