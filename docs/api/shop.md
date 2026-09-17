# shop-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8100` |
| **Nom Eureka** | `SHOP-SERVICE` |
| **Base path (via gateway)** | `/api/v1/shops` (préfixe de route : `Path=/api/v1/shops/**`) |
| **Base de données** | PostgreSQL (`shop`), migrations Flyway (`V1__init_database.sql`), `ddl-auto: validate` |
| **Authentification** | JWT requis sur `/shops`, `/shops/mine/**` (vérification locale, même secret que `auth-service`) + autorisation par rôle (`@PreAuthorize`). **`/shops/catalog/**` est public** (voir ci-dessous). |
| **Package** | `com.franck.ecommerce.shop`, `.stock`, `.sale`, `.dashboard`, `.catalog`, `.config`, `.handler` |

Service métier central de la fonctionnalité "gestion de boutique" **et catalogue produit unique du storefront** depuis le 2026-09-17 (voir revirement de décision ci-dessous). Chaque boutique (`Shop`) est rattachée à **une seule** gérante (`managerId`, unique — sauf la "boutique par défaut", sans gérante, qui héberge les produits migrés). Le stock (`StockItem`), les ventes (`Sale`/`SaleItem`) et le dashboard sous `/mine/**` sont **strictement scopés à la boutique de la gérante connectée**.

## ✅ Revirement de décision (2026-09-17) : `StockItem` est désormais LE catalogue

L'ancienne section documentait `StockItem` comme un domaine volontairement séparé du catalogue `product-service`. **Ce choix a été inversé** : le stock de chaque boutique **est** désormais le catalogue consulté et achetable par le storefront. Concrètement :

- **`GET /api/v1/shops/catalog/products`** (public, sans authentification) — liste tous les `StockItem` des boutiques `ACTIVE`, toutes gérantes confondues. C'est ce qu'appelle le frontend (`productApi.ts`) à la place de l'ancien `/api/v1/products`.
- **`POST /api/v1/shops/catalog/products/purchase`** / **`/restore`** (publics, appelés par `order-service`) — remplacent exactement l'ancien contrat `product-service` (mêmes noms de champs `productId`/`quantity`), sans aucun changement de code côté `order-service` : seule la valeur `application.config.product-url` a été repointée dans `order-service.yml` (config-server).
- **Migration automatique au démarrage** (`LegacyProductMigrationRunner`, `CommandLineRunner`) : au premier lancement de `shop-service`, tous les produits de l'ancien `product-service` (`GET http://localhost:8050/api/v1/products`, appel direct, hors gateway car `product-service` démarre avant `shop-service` dans `start-backend.sh`) sont copiés dans une **boutique par défaut** (`name: "Catalogue Général"`, `managerId: null`, `status: ACTIVE`). Idempotent : si cette boutique a déjà des `StockItem`, la migration est sautée (aucun risque de doublon au redémarrage).
- **`product-service` n'est plus consommé par personne** après cette migration (ni `order-service`, ni le frontend) — il continue de tourner mais devient vestigial. Non décommissionné à ce jour (voir Points d'attention).

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

## Endpoints — Catalogue public (`/api/v1/shops/catalog/products`)

**Aucune authentification.** Consommés par le storefront (frontend) et par `order-service` (achat/compensation lors d'une commande). Agrège le stock de **toutes** les boutiques `ACTIVE` (y compris la boutique par défaut issue de la migration).

### `GET /catalog/products` — Lister tout le catalogue
- **Réponse `200 OK`** : `CatalogProductResponse[]`

```json
[
  { "id": 1, "name": "T-shirt bleu", "description": "Coton", "availableQuantity": 43.0,
    "price": 19.99, "shopId": 1, "shopName": "Boutique Marie", "categoryName": "Vetements" },
  { "id": 1602, "name": "Mechanical Keyboard 1", "description": "...", "availableQuantity": 8.0,
    "price": 99.99, "shopId": 1602, "shopName": "Catalogue Général", "categoryName": "Keyboards" }
]
```

### `GET /catalog/products/{product-id}` — Détail d'un produit
- **Réponse `200 OK`** : `CatalogProductResponse` / **`404`** si id inconnu (peu importe la boutique)

### `POST /catalog/products/purchase` — Achat (appelé par `order-service`)
- **Body** : `[{ "productId": Integer, "quantity": double }]` — **contrat identique** à l'ancien `product-service`
- **Comportement (transactionnel)** : décrémente `StockItem.quantity` pour chaque ligne, peu importe à quelle boutique chaque `productId` appartient (un même panier peut mélanger des articles de plusieurs boutiques)
- **Réponse `200 OK`** : `CatalogPurchaseResponse[]`
- **Réponse `400 Bad Request`** : stock insuffisant ou `productId` inconnu (rollback complet, comme l'ancien `product-service`)

### `POST /catalog/products/restore` — Compensation (appelé par `order-service`)
- **Body** : identique à `/purchase`
- **Comportement** : réincrémente le stock ; `productId` disparu depuis → ignoré silencieusement (best-effort, comme l'ancien `product-service`)
- **Réponse `200 OK`**

✅ **Corrigé le 2026-09-17** : ces deux endpoints décrémentent `StockItem.quantity` de façon synchrone, mais ne créent **pas** de `Sale`/`SaleItem` directement. C'est `OrderIngestionService` (consommateur Kafka, voir section suivante) qui s'en charge **de façon asynchrone**, juste après — la gérante voit donc la commande apparaître avec un très léger délai (quelques centaines de ms en pratique), pas instantanément dans la même requête.

---

## Suivi de commande — consommation Kafka (`order-topic`)

`shop-service` consomme désormais le topic `order-topic` (déjà publié par `order-service` après paiement réussi, voir [notification.md](notification.md) qui le consomme aussi indépendamment, groupe Kafka distinct `shopOrderGroup`). Pour chaque `OrderConfirmation` reçue (`OrderIngestionService`) :

1. Les produits commandés sont regroupés par `StockItem.shopId` (**un panier peut mélanger plusieurs boutiques** → une `Sale` distincte est créée par boutique concernée, toutes partageant le même `orderReference`)
2. Pour chaque groupe, une `Sale` est créée avec `source: ONLINE`, `orderReference` (traçabilité vers la commande `order-service`), et les infos client dénormalisées (`customerId`, `customerFirstname`, `customerLastname`, `customerEmail`) — la gérante voit qui commande **sans appel réseau** à `customer-service`
3. Chaque ligne (`SaleItem`) démarre avec `status: CONFIRMED`
4. **Le stock n'est pas re-décrémenté ici** (déjà fait de façon synchrone par `CatalogService.purchase()` au moment de la commande) — ce service ne fait qu'enregistrer la vente pour la rendre visible

Produit non reconnu (`productId` sans `StockItem` correspondant) → ligne ignorée avec un `WARN` en log, le reste de la commande est traité normalement.

### `PATCH /api/v1/shops/mine/sales/{sale-id}/items/{item-id}/status` — Faire avancer le statut d'une ligne

- **Auth** : `SHOP_MANAGER`, scopé à sa boutique (`404` si la ligne appartient à une autre boutique — testé : `403`/`404` confirmés)
- **Body** (`SaleItemStatusUpdateRequest`) : `status*` — `PENDING` \| `CONFIRMED` \| `PREPARING` \| `SHIPPED` \| `DELIVERED` \| `CANCELLED` \| `EXPIRED` (flux normal linéaire `PENDING → ... → DELIVERED`, `CANCELLED`/`EXPIRED` accessibles à tout moment comme sorties)
- **Comportement** : met à jour **une seule ligne**, jamais la `Sale` entière — une gérante ne fait avancer que ses propres produits dans une commande qui peut en contenir d'autres d'une boutique différente
- **Réponse `200 OK`** : `SaleItemResponse`
- Aucune contrainte de transition n'est imposée côté serveur (on peut passer directement `CONFIRMED` → `DELIVERED`, ou revenir en arrière) — le frontend gérante propose une progression linéaire mais l'API ne l'impose pas

### `GET /api/v1/shops/catalog/orders/mine` — Suivi de commande côté client

- **Auth** : requise (n'importe quel rôle authentifié, mais utile pour `CLIENT`) — route **plus spécifique** que le `permitAll` de `/catalog/**`, résolue via un matcher dédié dans `SecurityConfig`
- **Résolution** : filtre les `Sale` par `customerId` (claim JWT `customerId`, présent uniquement pour les comptes `CLIENT` créés via `POST /auth/register` — voir [auth.md](auth.md)) et `source: ONLINE`
- **Réponse `200 OK`** : `SaleResponse[]` — **une entrée par boutique concernée**, pas une par commande (une commande à 2 boutiques = 2 entrées, même `orderReference`, `shopId` différent)
- **Réponse `409 Conflict`** : `{"error": "No customer profile associated with this account"}` si le compte n'a pas de `customerId` (ex. un `SHOP_MANAGER`/`ADMIN` qui appellerait cette route par erreur)

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

## Historique — ancienne décision de conception (inversée le 2026-09-17)

`StockItem` avait initialement été conçu comme un domaine **séparé** de `product-service`, avec la justification suivante : isolation multi-tenant forte, pas de couplage `shop-service` ↔ `product-service`, "gestion de stock" jugée fonctionnellement distincte d'"achat en ligne". **Ce choix a été explicitement inversé** (voir section en tête de document) : un client ne pouvait alors acheter aucun produit d'une boutique gérée, et les produits pré-existants n'étaient rattachés à aucune boutique — ce qui ne correspondait pas au besoin réel (un client doit pouvoir acheter les produits qu'une gérante vend). `StockItem` est désormais LE catalogue unique.

## Points d'attention

- ~~🔴 Une commande client ne crée aucun `Sale`/`SaleItem`~~ — ✅ **corrigé le 2026-09-17** via `OrderIngestionService` (consommateur Kafka `order-topic`), voir section dédiée ci-dessus.
- **Pas de déduplication Kafka** : si `OrderIngestionService` traite deux fois le même message (redélivraison après crash avant commit d'offset), une `Sale` en double serait créée — aucune clé d'idempotence (ex. `orderReference` + `shopId` unique) n'est appliquée aujourd'hui. Risque faible en pratique (offsets auto-commit, pas de retry applicatif), mais non garanti.
- **`OrderIngestionService` traite `order-topic` depuis `auto-offset-reset: earliest`** avec un `group-id` (`shopOrderGroup`) jamais utilisé auparavant : au tout premier démarrage après l'ajout de cette fonctionnalité, **tout l'historique Kafka encore rétenu** est rejoué (constaté : 6 commandes de test antérieures rattrapées rétroactivement en une fois). Comportement attendu et sans risque (le topic n'a pas de doublons à ce stade), mais à garder en tête si le topic contient un jour un vrai volume de production au moment d'activer cette fonctionnalité.
- **Aucune contrainte de transition de statut côté serveur** (`PATCH .../status`) : rien n'empêche de revenir de `DELIVERED` à `CONFIRMED`, ou de sauter directement à `CANCELLED` — seul le frontend gérante impose une progression linéaire (bouton "suivant" uniquement).
- **`status: INACTIVE` d'une boutique n'a aucun effet** sur les endpoints `/mine/**` **ni sur le catalogue public** : une boutique désactivée par un admin reste achetable via `/catalog/products` (le filtre `findByStatus(ACTIVE)` de `CatalogService.findAll()` l'exclurait de la liste, mais `findById` ne vérifie pas le statut — un lien direct vers un produit d'une boutique `INACTIVE` reste acheteur). Aucune vérification du `status` n'est faite non plus dans `ShopService.getShopEntityByManagerId`.
- **`StockAdjustmentRequest.reason` n'est pas persisté** : le champ est accepté et validé mais jamais sauvegardé — pas d'historique/audit des ajustements de stock.
- **Pas de pagination** sur `GET /stock`, `GET /sales`, `GET /catalog/products`, ni sur les calculs du dashboard — tout est chargé en mémoire (le catalogue combiné toutes boutiques confondues peut grossir vite).
- **`403` (pas `401`) sur token absent/invalide** sur les routes protégées — comportement par défaut de `@PreAuthorize` sans `AuthenticationEntryPoint` custom.
- **Pas de `DELETE /shops/{id}`** ni de `PUT /shops/{id}` générique côté admin (seuls `status` et `manager` sont modifiables individuellement).
- **`product-service` devient vestigial** après la migration initiale : plus aucun appelant (ni `order-service`, ni le frontend) ne le consomme. Il continue de tourner (démarré par `start-backend.sh`) mais n'a plus d'utilité fonctionnelle — à décommissionner explicitement si confirmé inutile durablement (garder pour l'instant : c'est la source de la migration au premier démarrage de `shop-service`, la couper avant une nouvelle migration sur une base `shop` vierge romprait `LegacyProductMigrationRunner`).
- **La "boutique par défaut" (`Catalogue Général`, `managerId: null`) n'est gérée par personne** : aucune gérante n'y a accès via `/mine/**` (elle n'a pas de `managerId` correspondant à un compte), et l'admin n'a pas d'endpoint pour créer/modifier son stock directement (seul `POST /shops/mine/stock` existe, réservé à une gérante avec boutique assignée). Ses 25 produits migrés sont donc **en lecture seule** en pratique jusqu'à ce qu'un mécanisme d'administration dédié soit ajouté.
