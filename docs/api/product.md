# product-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8050` |
| **Nom Eureka** | `PRODUCT-SERVICE` |
| **Base path (via gateway)** | `/api/v1/products` (préfixe de route : `Path=/api/v1/products/**`) |
| **Base de données** | PostgreSQL (`product`), schéma géré par Flyway (`V1__init_database.sql`, `V2__insert_data.sql` — jeu de données de démo : 5 catégories, 25 produits) |
| **Authentification** | Aucune |
| **Package** | `com.franck.ecommerce.product` (+ `com.franck.ecommerce.category`) |

Gère le catalogue produits (CRUD simplifié) et l'endpoint interne `/purchase` qui décrémente le stock. Consommé de façon synchrone par `order-service` (`ProductClient`, `RestTemplate`) lors de la création d'une commande.

## Modèle de données

### `ProductRequest` (body — POST)
| Champ | Type | Contrainte |
|---|---|---|
| `id` | `Integer` | ignoré (généré) |
| `name` | `String` | `@NotNull` |
| `description` | `String` | `@NotNull` |
| `availableQuantity` | `double` | `@Positive` |
| `price` | `BigDecimal` | `@Positive` |
| `categoryId` | `Integer` | `@NotNull` — **aucune vérification d'existence** de la catégorie n'est faite avant l'insertion (voir « Points d'attention ») |

### `ProductResponse`
`{ id, name, description, availableQuantity, price, categoryId, categoryName, categoryDescription }`

### `ProductPurchaseRequest` (élément de la liste envoyée à `/purchase`)
| Champ | Type | Contrainte |
|---|---|---|
| `productId` | `Integer` | `@NotNull` |
| `quantity` | `double` | `@Positive` |

### `ProductPurchaseResponse`
`{ productId, name, description, price, quantity }` — `quantity` = quantité achetée (pas le stock restant)

---

## `POST /api/v1/products` — Créer un produit

- **Auth** : aucune
- **Body** : `ProductRequest` (`@Valid`)
- **Réponse `200 OK`** : `Integer` — l'`id` généré (ex. `26`)
- **Réponse `400 Bad Request`** : `ErrorResponse` (`{errors: {champ: message}}`) si contraintes `@NotNull`/`@Positive` violées
- **Réponse `500 Internal Server Error`** (non documentée par un handler dédié) : si `categoryId` ne correspond à aucune catégorie existante → violation de contrainte de clé étrangère PostgreSQL non interceptée par le `GlobalExceptionHandler`

**Exemple**
```http
POST /api/v1/products HTTP/1.1
Content-Type: application/json

{
  "name": "Casque Gaming RGB",
  "description": "Casque avec micro et éclairage RGB",
  "availableQuantity": 50,
  "price": 79.99,
  "categoryId": 5
}
```
```json
26
```

---

## `GET /api/v1/products` — Lister tous les produits

- **Réponse `200 OK`** : `ProductResponse[]`

---

## `GET /api/v1/products/{product-id}` — Récupérer un produit

- **Path param** : `product-id` (`Integer`)
- **Réponse `200 OK`** : `ProductResponse`
- **Réponse `404 Not Found`** : texte brut `"Product not found with ID:: <id>"`. ✅ **Corrigé le 2026-08-20** (bug #4 du [rapport de tests](../TEST_REPORT.md#corrections-apportées-et-revalidées)) : le `GlobalExceptionHandler` mappait auparavant `EntityNotFoundException` sur `400`, incohérent avec `order-service`/`customer-service` — désormais aligné sur `404`.

---

## `POST /api/v1/products/purchase` — Achat / décrément de stock (usage interne inter-services)

Endpoint appelé par `order-service` lors de la création d'une commande ; peut aussi être appelé directement pour les tests.

- **Body** : `ProductPurchaseRequest[]` (pas de `@Valid` sur le contrôleur — la validation `@NotNull`/`@Positive` du record n'est **pas déclenchée** en l'absence de l'annotation `@Valid` sur le paramètre du endpoint ; les valeurs invalides passeront jusqu'au service)
- **Comportement** (`@Transactional`, rollback sur `ProductPurchaseException`) :
  1. Charge tous les produits demandés par `id`
  2. Si un ou plusieurs `productId` n'existent pas → `ProductPurchaseException`
  3. Pour chaque produit, si `availableQuantity < quantity` demandée → `ProductPurchaseException`
  4. Sinon décrémente le stock et sauvegarde
- **Réponse `200 OK`** : `ProductPurchaseResponse[]`, dans l'ordre trié par `productId` (⚠️ pas nécessairement l'ordre de la requête)
- **Réponse `400 Bad Request`** : texte brut — soit `"One or more products does not exist"`, soit `"Insufficient stock quantity for product with ID:: <id>"`

**Exemple — cas nominal**
```http
POST /api/v1/products/purchase HTTP/1.1
Content-Type: application/json

[ { "productId": 1, "quantity": 2 } ]
```
```json
[ { "productId": 1, "name": "Mechanical Keyboard 1", "description": "...", "price": 99.99, "quantity": 2 } ]
```

**Exemple — stock insuffisant**
```json
// Requête : { "productId": 1, "quantity": 999 }
```
→ `400 Bad Request` : `"Insufficient stock quantity for product with ID:: 1"`

---

## `POST /api/v1/products/restore` — Compensation d'un achat (usage interne inter-services)

✅ **Ajouté le 2026-08-20**. Endpoint de compensation (saga légère) appelé par `order-service` (`ProductClient.restoreStock`) lorsqu'une commande échoue après que le stock a déjà été décrémenté par `/purchase` (voir [order.md](order.md#-compensation-de-stock-saga-légère--ajoutée-le-2026-08-20)). Réincrémente le stock des produits fournis.

- **Body** : `ProductPurchaseRequest[]` (même forme que `/purchase`)
- **Comportement** : pour chaque `{productId, quantity}`, réincrémente `availableQuantity`. **Best-effort** : un `productId` qui n'existe plus (supprimé entre-temps) est ignoré et loggué en `WARN`, sans faire échouer le reste de la compensation.
- **Réponse `200 OK`** : corps vide
- Pas de code d'erreur dédié — un body structurellement invalide donnerait un `400` générique Spring (désérialisation JSON)

**Exemple**
```http
POST /api/v1/products/restore HTTP/1.1
Content-Type: application/json

[ { "productId": 1, "quantity": 3 } ]
```
→ `200 OK`, stock du produit 1 réincrémenté de 3.

---

## Points d'attention

- ~~`GET /{product-id}` renvoie **400** et non 404 pour un produit absent~~ — ✅ corrigé (voir ci-dessus).
- `POST /purchase` n'a pas de validation Bean Validation active (`@Valid` manquant sur le contrôleur) — une quantité négative ou un `productId` nul peuvent atteindre la couche service.
- `POST /products` ne vérifie pas que `categoryId` existe avant insertion → erreur SQL brute possible (500 non géré) au lieu d'un 400 propre.
- Pas d'endpoint `PUT`/`DELETE` sur les produits, ni de gestion des catégories (`Category`) exposée via API — uniquement peuplées par les migrations Flyway.
