# shop-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8100` |
| **Nom Eureka** | `SHOP-SERVICE` |
| **Base path (via gateway)** | `/api/v1/shops` (préfixe de route : `Path=/api/v1/shops/**`) |
| **Base de données** | PostgreSQL (`shop`), migrations Flyway (`V1__init_database.sql`), `ddl-auto: validate` |
| **Authentification** | JWT requis sur **tous** les endpoints, vérification locale (même secret que `auth-service`) + autorisation par rôle (`@PreAuthorize`) |
| **Package** | `com.franck.ecommerce.shop`, `.stock`, `.sale`, `.dashboard`, `.config`, `.handler` |

Service métier central de la fonctionnalité "gestion de boutique". Chaque boutique (`Shop`) est rattachée à **une seule** gérante (`managerId`, unique). Le stock (`StockItem`), les ventes (`Sale`/`SaleItem`) et le dashboard sont **strictement scopés à la boutique de la gérante connectée** — aucun paramètre `shopId` n'est jamais accepté en entrée sur les routes `/mine/**` : il est toujours résolu côté serveur à partir du JWT (`userId` → `Shop.managerId`).

⚠️ **Domaine indépendant du catalogue `product-service`** : `StockItem` ne référence **pas** les `Product` de `product-service` (pas de FK, pas d'appel réseau). C'est un choix architectural délibéré (voir décision de conception ci-dessous) — le stock de boutique est un inventaire local à la gérante, distinct du catalogue e-commerce central.

---

## Rôles et autorisations

| Rôle | Accès |
|---|---|
| `ADMIN` | `POST /shops`, `GET /shops`, `GET /shops/{id}`, `PUT /shops/{id}/status`, `PUT /shops/{id}/manager` |
| `SHOP_MANAGER` | `GET/PUT /shops/mine`, tout `/shops/mine/stock/**`, tout `/shops/mine/sales/**`, `GET /shops/mine/dashboard` |

Vérification à deux niveaux :
1. **`JwtAuthenticationFilter`** (authentification) — valide la signature/expiration du token, peuple `SecurityContextHolder` avec un principal `AuthenticatedUser(userId, email, role)` et l'autorité `ROLE_<role>`.
2. **`@PreAuthorize("hasRole('...')")`** sur chaque contrôleur (autorisation) — `403 Forbidden` si le rôle ne correspond pas, `403 Forbidden` également si le token est absent (pas de `401` — comportement Spring Security par défaut avec `@PreAuthorize`, à noter côté frontend).

---

## Modèle de données

### `Shop` (table `shop`)
| Champ | Type | Contrainte |
|---|---|---|
| `id` | `Integer` | PK auto |
| `name` | `String` | requis |
| `description` | `String` | optionnel |
| `street`, `city`, `zipCode` | `String` | optionnels |
| `managerId` | `String` | **unique** — id `User` (auth-service) de la gérante assignée |
| `managerEmail` | `String` | dénormalisé pour affichage |
| `status` | `ShopStatus` enum | `ACTIVE` \| `INACTIVE` |
| `createdDate` / `lastModifiedDate` | `LocalDateTime` | auto (`@CreatedDate`/`@LastModifiedDate`) |

### `StockItem` (table `stock_item`)
| Champ | Type | Contrainte |
|---|---|---|
| `id` | `Integer` | PK auto |
| `shopId` | `Integer` | FK → `shop`, résolu serveur (jamais dans le body) |
| `name` | `String` | requis |
| `description`, `category` | `String` | optionnels |
| `price` | `BigDecimal` | requis, `@Positive` |
| `quantity` | `Integer` | requis, `@PositiveOrZero` |
| `lowStockThreshold` | `Integer` | défaut `5` si non fourni |
| `createdDate` / `lastModifiedDate` | `LocalDateTime` | auto |

### `Sale` / `SaleItem` (tables `sale`, `sale_item`)
| Champ (`Sale`) | Type |
|---|---|
| `id` | `Integer` |
| `shopId` | `Integer` |
| `reference` | `String` unique, généré serveur : `"SALE-" + UUID8CARS` |
| `totalAmount` | `BigDecimal` — somme des lignes |
| `items` | `List<SaleItem>` — cascade `ALL`, `orphanRemoval` |
| `createdDate` | `LocalDateTime` |

| Champ (`SaleItem`) | Type |
|---|---|
| `stockItemId` | `Integer` |
| `stockItemName` | `String` — **snapshot** du nom au moment de la vente (dénormalisé, ne change pas si l'article est renommé après coup) |
| `unitPrice` | `BigDecimal` — snapshot du prix au moment de la vente |
| `quantity` | `Integer` |

### DTOs de réponse
- `ShopResponse` : tous les champs de `Shop` (à plat)
- `StockItemResponse` : champs de `StockItem` + **`lowStock: boolean`** calculé (`quantity <= lowStockThreshold`)
- `SaleResponse` : champs de `Sale` + `items: SaleItemResponse[]`

### `ErrorResponse`
`{ errors: { "<nomChamp ou 'error'>": "<message>" } }` — `400` (validation), `404` (`ResourceNotFoundException`), `409` (`BusinessException`, ex. manager déjà assigné, stock insuffisant)

---

## Endpoints — Admin (`hasRole('ADMIN')`)

### `POST /api/v1/shops` — Créer une boutique et assigner une gérante

- **Body** (`CreateShopRequest`) : `name*`, `description`, `street`, `city`, `zipCode`, `managerId*`, `managerEmail`
- **Réponse `201 Created`** : `ShopResponse`, `status: ACTIVE`
- **Réponse `409 Conflict`** : si `managerId` est déjà assigné à une autre boutique (`existsByManagerId`)
- **Réponse `403 Forbidden`** : si appelant non-`ADMIN`

```json
// Requête
{
  "name": "Boutique Marie",
  "description": "Ma petite boutique",
  "street": "1 rue de Paris", "city": "Paris", "zipCode": "75001",
  "managerId": "6aabb41fb27285682e44c59e",
  "managerEmail": "marie@kshop.com"
}
```

### `GET /api/v1/shops` — Lister toutes les boutiques
- **Réponse `200 OK`** : `ShopResponse[]`

### `GET /api/v1/shops/{shop-id}` — Détail d'une boutique
- **Réponse `200 OK`** : `ShopResponse` / **`404`** si id inconnu

### `PUT /api/v1/shops/{shop-id}/status?status=ACTIVE|INACTIVE` — Activer/désactiver
- **Query param** : `status` (`ShopStatus`)
- **Réponse `200 OK`** : `ShopResponse` mis à jour
- ⚠️ Aucun effet de bord documenté/implémenté sur `INACTIVE` (la gérante garde l'accès à ses endpoints `/mine/**` même boutique désactivée — pas de vérification du `status` dans `ShopService`/contrôleurs `/mine/**`, voir [Points d'attention](#points-dattention))

### `PUT /api/v1/shops/{shop-id}/manager?managerId=...&managerEmail=...` — Réassigner une gérante
- **Réponse `200 OK`** : `ShopResponse`
- **Réponse `409 Conflict`** : si le nouveau `managerId` a déjà une boutique

---

## Endpoints — Gérante : sa boutique (`hasRole('SHOP_MANAGER')`)

### `GET /api/v1/shops/mine` — Voir sa boutique
- **Réponse `200 OK`** : `ShopResponse`
- **Réponse `404 Not Found`** : `{"error": "No shop assigned to this manager"}` si aucune boutique ne lui est assignée (cas d'une gérante inscrite mais pas encore affectée par un admin)

### `PUT /api/v1/shops/mine` — Modifier les infos de sa boutique
- **Body** (`ShopRequest`) : `name*`, `description`, `street`, `city`, `zipCode` (pas de `managerId`/`status` — non modifiables par la gérante)
- **Réponse `200 OK`** : `ShopResponse`

---

## Endpoints — Gérante : Stock (`/api/v1/shops/mine/stock`)

### `POST /stock` — Créer un article
- **Body** (`StockItemRequest`) : `name*`, `description`, `category`, `price*` (`>0`), `quantity*` (`>=0`), `lowStockThreshold` (défaut `5`)
- **Réponse `201 Created`** : `StockItemResponse`

### `GET /stock?lowStockOnly=false` — Lister le stock
- **Query param optionnel** : `lowStockOnly` (bool, défaut `false`) — filtre `quantity <= lowStockThreshold`
- **Réponse `200 OK`** : `StockItemResponse[]`

### `GET /stock/{item-id}` — Détail d'un article
- **Réponse `200 OK`** / **`404`** si l'article n'existe pas **ou appartient à une autre boutique** (`findByIdAndShopId` — isolation stricte)

### `PUT /stock/{item-id}` — Modifier un article
- **Body** : `StockItemRequest` complet (remplace `name`, `description`, `category`, `price`, `quantity`, et `lowStockThreshold` si fourni)
- **Réponse `200 OK`** : `StockItemResponse`
- ⚠️ `quantity` est **écrasée** par cet endpoint (pas un ajustement relatif) — pour un ajustement, utiliser `PATCH /quantity` ci-dessous

### `PATCH /stock/{item-id}/quantity` — Ajuster la quantité (delta relatif)
- **Body** (`StockAdjustmentRequest`) : `delta*` (Integer, signé — positif = réapprovisionnement, négatif = correction/perte), `reason` (optionnel, **non persisté actuellement** — voir Points d'attention)
- **Réponse `200 OK`** : `StockItemResponse` avec `quantity` mise à jour
- **Réponse `409 Conflict`** : `{"error": "Resulting quantity cannot be negative"}` si `quantity + delta < 0`

```json
// Réapprovisionnement de +20
{ "delta": 20, "reason": "Reapprovisionnement fournisseur" }
```

### `DELETE /stock/{item-id}` — Supprimer un article
- **Réponse `204 No Content`**
- **Réponse `404`** si hors périmètre de la boutique

---

## Endpoints — Gérante : Ventes (`/api/v1/shops/mine/sales`)

### `POST /sales` — Enregistrer une vente
- **Body** (`SaleRequest`) : `items*` — liste non vide de `{ stockItemId*, quantity* (>0) }`
- **Comportement (transactionnel, `@Transactional`)** :
  1. Pour chaque ligne : vérifie que l'article appartient à la boutique et que `quantity` disponible ≥ `quantity` demandée
  2. Décrémente `StockItem.quantity` et sauvegarde
  3. Calcule `totalAmount = Σ(unitPrice × quantity)` au **prix courant de l'article** au moment de la vente
  4. Persiste `Sale` + `SaleItem[]` (snapshot du nom/prix)
- **Réponse `201 Created`** : `SaleResponse` (avec `reference` généré, ex. `SALE-D9214050`)
- **Réponse `409 Conflict`** : `{"error": "Insufficient stock for item '<name>': available X, requested Y"}` — **toute la vente est annulée** (rollback transactionnel) si une seule ligne échoue, aucun décrément partiel
- **Réponse `404 Not Found`** : si un `stockItemId` n'existe pas ou appartient à une autre boutique

```json
// Requête
{ "items": [ { "stockItemId": 1, "quantity": 5 }, { "stockItemId": 2, "quantity": 2 } ] }
// Réponse 201
{
  "id": 1, "shopId": 1, "reference": "SALE-D9214050", "totalAmount": 119.93,
  "items": [
    { "stockItemId": 1, "stockItemName": "T-shirt bleu", "unitPrice": 19.99, "quantity": 5 },
    { "stockItemId": 2, "stockItemName": "Casquette", "unitPrice": 9.99, "quantity": 2 }
  ],
  "createdDate": "2026-09-17T10:34:44.076"
}
```

### `GET /sales` — Historique des ventes
- **Réponse `200 OK`** : `SaleResponse[]`, triées `createdDate DESC` (plus récentes d'abord)

### `GET /sales/{sale-id}` — Détail d'une vente
- **Réponse `200 OK`** / **`404`** si hors périmètre de la boutique

---

## Endpoint — Dashboard (`GET /api/v1/shops/mine/dashboard`)

Agrégats calculés **à la volée** à chaque appel (pas de cache, pas de table de stats pré-calculée) :

```json
{
  "totalStockItems": 2,
  "lowStockItemsCount": 0,
  "totalStockValue": 1109.34,
  "totalSalesCount": 1,
  "totalRevenue": 119.93,
  "topSellingItems": [
    { "name": "T-shirt bleu", "quantitySold": 5, "revenue": 99.95 },
    { "name": "Casquette", "quantitySold": 2, "revenue": 19.98 }
  ],
  "lowStockItems": []
}
```

| Champ | Calcul |
|---|---|
| `totalStockItems` | `count(StockItem)` de la boutique |
| `lowStockItemsCount` | `count(quantity <= lowStockThreshold)` |
| `totalStockValue` | `Σ(price × quantity)` sur tout le stock actuel |
| `totalSalesCount` | `count(Sale)` de la boutique |
| `totalRevenue` | `Σ(Sale.totalAmount)` sur toutes les ventes historiques |
| `topSellingItems` | top 5 par **quantité vendue cumulée**, groupé par `stockItemName` (nom au moment de chaque vente — deux articles distincts avec le même nom historique seraient fusionnés) |
| `lowStockItems` | liste triée par `quantity` croissante des articles en stock faible |

⚠️ Calcul **non paginé, non mis en cache** : recharge tout l'historique des ventes (`findByShopIdOrderByCreatedDateDesc`) et tout le stock à chaque appel — acceptable en volumétrie de développement, à revoir si l'historique grossit significativement.

---

## Sécurité — détails d'implémentation

Contrairement à `auth-service`, `shop-service` **ne dépend pas** d'un appel réseau à `auth-service` pour valider un token : `JwtService` (validation seule, pas de génération) déchiffre et vérifie la signature localement avec la **même clé secrète HS384** que `auth-service` (dupliquée dans `shop-service.yml`). Avantages : pas de couplage temporel au démarrage, pas de latence réseau par requête. Inconvénient : toute rotation de clé doit être appliquée en synchronisation sur les deux services.

`AuthenticatedUser(userId, email, role)` est injecté dans les contrôleurs via `@AuthenticationPrincipal` — c'est le principal Spring Security posé par `JwtAuthenticationFilter`, pas un objet rechargé depuis une base.

## Décision de conception : stock indépendant du catalogue `product-service`

Le stock de boutique (`StockItem`) a été conçu comme un **domaine séparé** de `product` (`product-service`, PostgreSQL, catalogue e-commerce central utilisé par le flux de commande `order → product → payment`), plutôt que d'ajouter un `shopId` sur l'entité `Product` existante. Raisons :
- Isolation forte multi-tenant (chaque gérante gère un inventaire qui lui est propre, sans risque de collision avec le catalogue public)
- Pas de couplage supplémentaire entre `shop-service` et `product-service` (pas d'appel Feign/RestTemplate croisé)
- Le domaine "gestion de stock de boutique" (ventes en direct, réapprovisionnement) est fonctionnellement distinct du domaine "achat en ligne" (`order-service`)

**Conséquence documentée** : les articles de stock d'une boutique **n'apparaissent pas** dans le catalogue consulté par le frontend e-commerce (`/api/v1/products`), et une vente enregistrée via `POST /shops/mine/sales` ne crée **aucune** `Order`/`Payment` dans `order-service`/`payment-service`. Si un besoin futur de synchronisation catalogue ↔ stock de boutique apparaît, il faudra un pont explicite (événement Kafka ou appel REST) entre les deux domaines — non implémenté à ce jour.

## Points d'attention

- **`status: INACTIVE` d'une boutique n'a aucun effet** sur les endpoints `/mine/**` : une gérante dont la boutique est désactivée par un admin garde un accès total (CRUD stock, ventes, dashboard). Aucune vérification du `status` n'est faite dans `ShopService.getShopEntityByManagerId` ni dans les contrôleurs `/mine/**`. À corriger si la désactivation doit réellement bloquer l'accès.
- **`StockAdjustmentRequest.reason` n'est pas persisté** : le champ est accepté et validé mais jamais sauvegardé — pas d'historique/audit des ajustements de stock (seul le nouvel état de `quantity` est visible, pas la raison ni la date de l'ajustement individuel).
- **Pas de pagination** sur `GET /stock`, `GET /sales`, ni sur les calculs du dashboard — tout est chargé en mémoire.
- **`403` (pas `401`) sur token absent/invalide** : comportement par défaut de `@PreAuthorize` sans `AuthenticationEntryPoint` custom — à garder en tête côté frontend pour différencier "non connecté" de "rôle insuffisant" (actuellement indifférenciable par le code HTTP seul).
- **`GET /shops/{shop-id}` (admin) ne vérifie pas les autres méthodes CRUD** manquantes côté admin : pas de `DELETE /shops/{id}` (suppression de boutique), pas de `PUT /shops/{id}` générique (seuls `status` et `manager` sont modifiables individuellement par un admin — la gérante modifie le reste via `/mine`).
