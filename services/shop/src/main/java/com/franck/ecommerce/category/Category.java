package com.franck.ecommerce.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Référentiel de catégories pour le stock des boutiques. StockItem.category reste un
// champ texte libre (aucune FK) pour ne pas casser les données existantes — cette liste
// sert de référence/suggestion pour le frontend (menu déroulant au lieu de saisie libre),
// pas de contrainte d'intégrité imposée côté base.
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue
    private Integer id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;
}
