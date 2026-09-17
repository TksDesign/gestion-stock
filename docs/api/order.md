# order-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8070` |
| **Nom Eureka** | `ORDER-SERVICE` |
| **Base path (via gateway)** | `/api/v1/orders` et `/api/v1/order-lines` (deux routes gateway distinctes vers le même service) |
| **Base de données** | PostgreSQL (`order`), `ddl-auto: create` (schéma recréé à chaque démarrage — **toutes les données sont perdues** à chaque redémarrage du service) |
| **Authentification** | Aucune |
| **Package** | `com.franck.ecommerce.order`, `com.franck.ecommerce.orderline` |

Service central du flux d'achat : orchestre `customer-service` (Feign, synchrone), `product-service` (RestTemplate, synchrone), `payment-service` (Feign, synchrone) puis publie un événement Kafka `order-topic` consommé par `notification-service`.

## Clients inter-services utilisés par `POST /api/v1/orders`

| Client | Technologie | Cible | Configuration |
|---|---|---|---|
| `CustomerClient` | Feign (`@FeignClient`) | `GET {customer-url}/{customer-id}` | `application.config.customer-url = http://localhost:8222/api/v1/customers` (⚠️ pointe vers la **gateway**, pas directement vers `customer-service`) |
| `ProductClient` | `RestTemplate` manuel | `POST {product-url}/purchase` | `application.config.product-url = http://localhost:8222/api/v1/products` (idem, via gateway) |
| `PaymentClient` | Feign (`@FeignClient`) | `POST {payment-url}` | `application.config.payment-url = http://localhost:8222/api/v1/payments` (via gateway). ✅ **Corrigé le 2026-08-20** : l'annotation était `@FeignClient(name = "product-service", url = ...)` (copier-coller erroné), désormais `name = "payment-service"`. |
| `ProductClient.restoreStock` | `RestTemplate` manuel | `POST {product-url}/restore` | Compensation (saga légère) ajoutée le 2026-08-20 — voir section dédiée ci-dessous. |

## Modèle de données

### `OrderRequest` (body — POST `/orders`)
| Champ | Type | Contrainte |
|---|---|---|
| `id` | `Integer` | ignoré (généré) |
| `reference` | `String` | aucune contrainte serveur (peut être vide/null) |
| `amount` | `BigDecimal` | `@Positive` |
| `paymentMethod` | `PaymentMethod` (enum : `PAYPAL`, `CREDIT_CARD`, `VISA`, `MASTER_CARD`, `BITCOIN`) | `@NotNull` |
| `customerId` | `String` | `@NotNull @NotEmpty @NotBlank` |
| `products` | `PurchaseRequest[]` | `@NotEmpty` — au moins un article |

`PurchaseRequest` : `{ productId: Integer (@NotNull), quantity: double (@Positive) }`

### `OrderResponse`
`{ id, reference, amount, paymentMethod, customerId }` — **ne contient pas la liste des lignes de commande** (voir `/api/v1/order-lines/order/{order-id}` pour ça)

✅ **Corrigé le 2026-08-20** (bug #2, critique, du [rapport de tests](../TEST_REPORT.md#corrections-apportées-et-revalidées)) : `amount` n'apparaissait auparavant **jamais** dans la réponse réelle, y compris juste après une création réussie — `OrderMapper.toOrder()` ne mappait pas `request.amount()` vers l'entité `Order` (le champ `totalAmount` n'était jamais renseigné à la sauvegarde). Revalidé : `GET /api/v1/orders/{id}` renvoie désormais le montant attendu.

### `OrderLineResponse`
`{ id, quantity }` — ne contient ni `productId` ni `orderId` (DTO minimal)

---

## `POST /api/v1/orders` — Créer une commande (flux principal)

- **Auth** : aucune
- **Body** : `OrderRequest` (`@Valid`)
- **Séquence exécutée** (dans une seule `@Transactional` côté JPA, qui ne couvre que les écritures locales `Order`/`OrderLine` — les appels HTTP externes ne sont pas concernés par ce rollback JPA, d'où la compensation explicite ajoutée le 2026-08-20, voir plus bas) :
  1. `CustomerClient.findCustomerById(customerId)` → `customer-service` renvoie `404` pour un client absent (voir [customer.md](customer.md)), donc Feign lève une `feign.FeignException$NotFound` **avant même d'atteindre le `.orElseThrow(BusinessException)`** — ce code applicatif reste inutilisé en pratique (il ne s'exécuterait que si `customer-service` répondait `200` avec un corps vide), mais ce n'est plus un problème : ✅ voir le fix ci-dessous, la `FeignException` est désormais correctement traduite.
  2. `ProductClient.purchaseProducts(products)` → appelle `POST /api/v1/products/purchase`. En cas de `4xx`/`5xx` renvoyé par `product-service` (stock insuffisant, produit inexistant), le `RestTemplate` par défaut lève une `HttpStatusCodeException` — ✅ également relayée depuis le fix ci-dessous.
  3. Sauvegarde de la commande (PostgreSQL)
  4. Sauvegarde d'une `OrderLine` par produit acheté
  5. `PaymentClient.requestOrderPayment(...)` → `POST /api/v1/payments` (voir [payment.md](payment.md)) — le paiement est **toujours accepté** (pas de logique de refus, voir doc payment)
  6. Publication asynchrone d'un message `OrderConfirmation` sur le topic Kafka `order-topic` (consommé par `notification-service`)
- **Réponse `200 OK`** : `Integer` — l'`id` de la commande créée
- **Réponse `400 Bad Request`** : `ErrorResponse` (validation Bean Validation sur le body) **ou** texte brut relayé de `product-service` (produit inexistant, stock insuffisant)
- **Réponse `404 Not Found`** : texte brut relayé de `customer-service` si `customerId` inexistant

  ✅ **Corrigé le 2026-08-20** (bug #3, majeur, du [rapport de tests](../TEST_REPORT.md#corrections-apportées-et-revalidées)) : ces 3 cas remontaient auparavant **tous** en `500 Internal Server Error` générique, sans distinction possible pour l'appelant (même corps, aucun message exploitable). Le `GlobalExceptionHandler` intercepte désormais `FeignException` et `HttpStatusCodeException` et relaie le vrai statut + le vrai message métier du service en amont.

**Exemple — cas nominal**
```http
POST /api/v1/orders HTTP/1.1
Content-Type: application/json

{
  "reference": "CMD-2026-0001",
  "amount": 199.98,
  "paymentMethod": "CREDIT_CARD",
  "customerId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "products": [ { "productId": 1, "quantity": 2 } ]
}
```
```json
14
```

**Exemple — client inexistant** (revalidé le 2026-08-20)
```json
// customerId: "id-client-bidon"
```
→ **`404 Not Found`** : `"No customer found with the provided ID: id-client-bidon"`

**Exemple — produit inexistant** (revalidé le 2026-08-20)
→ **`400 Bad Request`** : `"One or more products does not exist"`

**Exemple — stock insuffisant** (revalidé le 2026-08-20)
→ **`400 Bad Request`** : `"Insufficient stock quantity for product with ID:: <id>"`

## ✅ Compensation de stock (saga légère) — ajoutée le 2026-08-20

Le stock décrémenté par `product-service` lors de l'étape 2 (`purchaseProducts`) est **hors de la transaction JPA locale** d'`order-service` : un rollback Spring ne l'annule pas. Avant le 2026-08-20, toute erreur survenant **après** ce décrément (paiement refusé, erreur de sauvegarde de la commande) laissait le stock définitivement décrémenté sans qu'aucune commande valide n'existe en contrepartie.

**Correctif** : les étapes 3 à 5 (sauvegarde de la commande, des lignes, et l'appel au paiement) sont désormais entourées d'un `try/catch` dans `OrderService.createOrder()`. Sur toute `RuntimeException` dans ce bloc, `ProductClient.restoreStock(...)` est appelé — il déclenche `POST /api/v1/products/restore` côté `product-service`, qui réincrémente le stock des produits concernés (best-effort : un produit supprimé entre-temps est ignoré et loggué en `WARN`, sans faire échouer la compensation) — puis l'exception d'origine est relancée telle quelle (le code/message renvoyé à l'appelant n'est pas affecté par la compensation).

Au-delà de l'étape 5 (paiement confirmé avec succès), la compensation ne s'applique plus : la publication Kafka (étape 6, fire-and-forget) n'a aucune raison métier de déclencher un remboursement de stock si elle échouait exceptionnellement.

**Limites** : ce n'est pas une saga complète — pas d'outbox pattern, pas d'état de saga persisté et rejouable, compensation best-effort (si l'appel `/restore` lui-même échoue, l'incident est seulement loggué en `ERROR`, à surveiller manuellement). Suffisant pour le scénario concret documenté et testé (paiement échoue après décrément de stock), pas conçu pour une résilience totale face à des pannes en cascade.

**Revalidé le 2026-08-20** : `payment-service` arrêté artificiellement, commande passée avec un produit en stock (`8`) → décrément immédiat à `5` → échec du paiement → stock restauré à `8` (confirmé par lecture directe de l'API après coup), aucune commande orpheline en base (le rollback JPA a bien annulé l'insertion `Order`/`OrderLine`).

---

## `GET /api/v1/orders` — Lister toutes les commandes

- **Réponse `200 OK`** : `OrderResponse[]`

---

## `GET /api/v1/orders/{order-id}` — Récupérer une commande

- **Path param** : `order-id` (`Integer`)
- **Réponse `200 OK`** : `OrderResponse`
- **Réponse `404 Not Found`** : texte brut `"No order found with the provided ID: <id>"`

---

## `GET /api/v1/order-lines/order/{order-id}` — Lister les lignes d'une commande

- **Path param** : `order-id` (`Integer`)
- **Réponse `200 OK`** : `OrderLineResponse[]` — **retourne `[]` silencieusement** si la commande n'existe pas (aucune vérification d'existence de la commande, pas de 404 possible)

---

## Points d'attention

- ~~`amount` n'est jamais persisté sur la commande~~ — ✅ corrigé.
- ~~Tout échec en aval (client/produit/stock) remonte en `500` générique~~ — ✅ corrigé.
- ~~Pas de transaction distribuée / saga~~ — ✅ compensation de stock ajoutée (voir section dédiée ci-dessus) ; reste une saga *légère*, pas une solution générique (voir « Limites » ci-dessus).
- ~~`@FeignClient(name = "product-service")` sur `PaymentClient`~~ — ✅ corrigé.
- `ddl-auto: create` sur le schéma PostgreSQL : toute donnée est perdue à chaque redémarrage du service — à changer en `validate`/`update` + migration Flyway avant tout usage non-jetable. Non corrigé (hors périmètre demandé).
- Les clients Feign/RestTemplate pointent vers `localhost:8222` (la gateway) : en environnement conteneurisé (pas de Dockerfile fourni actuellement), ces URLs devront être adaptées ou basculées vers la résolution Eureka par nom logique.
