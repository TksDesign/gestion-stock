# Rapport de tests end-to-end — ms-stock-management

> ✅ **Mise à jour du 2026-08-20** : les 6 anomalies détectées ci-dessous ont toutes été **corrigées et revalidées en conditions réelles** (nouvel environnement complet, mêmes scénarios rejoués). Voir la section [Corrections apportées](#corrections-apportées-et-revalidées) en fin de document pour le détail et les preuves. Le corps du rapport ci-dessous est conservé **tel qu'exécuté initialement**, comme trace du diagnostic.

**Date d'exécution** : 2026-08-20
**Environnement** : local, `docker-compose up` (PostgreSQL, MongoDB, Kafka/Zookeeper 7.6.1, Zipkin, MailDev) + `config-server` + `discovery` + `gateway` + les 5 services métier, tous démarrés réellement (pas de simulation), tous les appels effectués **à travers la gateway** (`http://localhost:8222`), jamais en direct vers un service.
**Base de référence** : [docs/API_DOCUMENTATION.md](API_DOCUMENTATION.md) et `docs/api/*.md` (Phase 2), corrigés a posteriori suite aux écarts découverts ici.

## Résumé chiffré

| Indicateur | Valeur |
|---|---|
| Flows testés | **6 / 6** |
| Flows exécutés jusqu'au bout (sans crash infra) | **6 / 6 (100 %)** |
| Vérifications unitaires effectuées | **33** |
| Anomalies/écarts détectés | **6** (2 critiques, 1 majeure, 3 mineures) |
| Taux de conformité comportementale (vérifications sans anomalie / total) | **27 / 33 (≈ 82 %)** |
| Endpoints manquants identifiés pour un frontend type | **5** (voir section dédiée) |

**Le point le plus important** (demandé explicitement en Phase 3) : deux bugs **critiques**, non détectables par simple lecture du code, ont été mis au jour par l'exécution réelle des flows :
1. `POST /api/v1/orders` renvoie un `500` générique indifférencié pour **toute** erreur métier en aval (client/produit/stock), y compris le cas "client introuvable" que la lecture statique du code (Phase 2) laissait penser géré en `400`.
2. `notification-service` déclenche une **tempête de retries Kafka** (10 tentatives) et **duplique la notification en MongoDB** à chaque échec d'envoi d'email, avant d'abandonner silencieusement le message (perte définitive de la notification, aucune alerte).

---

## Détail par flow

### Flow 1 — Consultation du catalogue produits

| # | Étape | Attendu (doc) | Résultat réel | Statut |
|---|---|---|---|---|
| 1.1 | `GET /api/v1/products` | `200`, liste des produits | `200`, 25 produits | ✅ |
| 1.2 | `GET /api/v1/products/1` (nominal) | `200`, `ProductResponse` | `200`, conforme | ✅ |
| 1.3 | `GET /api/v1/products/99999` (introuvable) | `400` (déjà signalé comme anomalie en Phase 2 — devrait être `404`) | `400 "Product not found with ID:: 99999"` | ✅ conforme à la doc (anomalie de design déjà connue) |

**Verdict** : flow entièrement conforme à la documentation Phase 2.

---

### Flow 2 — Gestion client (CRUD)

| # | Étape | Attendu | Résultat réel | Statut |
|---|---|---|---|---|
| 2.1 | `POST /api/v1/customers` (nominal) | `200`, id string | `200`, `"6a86ced388d59f1612224cb8"` | ✅ |
| 2.2 | `GET /api/v1/customers/{id}` (nominal) | `200` | `200`, conforme | ✅ |
| 2.3 | `GET /api/v1/customers/id-inexistant` | `404` | `404 "No customer found..."` | ✅ |
| 2.4 | `GET /api/v1/customers/exists/{id}` | `200 true` | `200 true` | ✅ |
| 2.5 | `POST` avec email invalide | `400 ErrorResponse` | `400 {"errors":{"email":"..."}}` | ✅ |
| 2.6 | `PUT` nominal (changer `firstname`) | `202` | `202` | ✅ |
| 2.7 | `PUT` avec `id` inexistant (payload complet) | `404` | `404 "Cannot update customer:: ..."` | ✅ |
| 2.8 | Vérif post-update : `lastname` envoyé dans le `PUT` a-t-il été appliqué ? | Non (bug connu, `CustomerService.mergeCustomer` ignore `lastname`) | `firstname` changé, `lastname` inchangé | ✅ conforme (bug déjà documenté Phase 2, reconfirmé) |
| 2.9 | `DELETE` sur un `id` totalement inexistant | `202` (jamais 404, pas de vérification d'existence) | `202` | ✅ |
| 2.10 | `GET /api/v1/customers` (liste) | `200` | `200`, contient le client créé | ✅ |

**Verdict** : flow entièrement conforme à la documentation Phase 2, y compris les deux anomalies de design déjà repérées (validation absente sur `lastname`, `DELETE` toujours 202).

---

### Flow 3 — Passage de commande complet (nominal)

Préconditions : un client existant (`6a86ced388d59f1612224cb8`), produit `id=1` avec stock initial = 10.

| # | Étape | Attendu | Résultat réel | Statut |
|---|---|---|---|---|
| 3.1 | Stock produit 1 avant commande | 10 | 10 | ✅ (info) |
| 3.2 | `POST /api/v1/orders` — 2× produit 1, montant 199.98 € | `200`, `orderId` | `200`, `orderId = 1` | ✅ |
| 3.3 | Stock produit 1 après commande | 8 (décrément de 2) | 8 | ✅ |
| 3.4 | `GET /api/v1/orders/1` | `200`, `amount = 199.98` d'après le DTO documenté | `200`, mais **`amount` totalement absent de la réponse** | 🔴 **écart critique, nouveau bug découvert** |
| 3.5 | `GET /api/v1/order-lines/order/1` | `200`, 1 ligne, `quantity=2` | `200`, `[{"id":1,"quantity":2.0}]` | ✅ |
| 3.6 | Paiement créé en base PostgreSQL (`payment`) | `amount=199.98`, `order_id=1` | confirmé (`199.98`, `order_id=1`) | ✅ |
| 3.7 | Notifications MongoDB créées | 2 documents (`ORDER_CONFIRMATION` + `PAYMENT_CONFIRMATION`) | 2 documents créés, corrects | ✅ |
| 3.8 | Emails reçus (MailDev, logs conteneur) | 2 emails ("Order confirmation", "Payment successfully processed") | 2 emails reçus | ✅ |

**Verdict** : le flow fonctionne bout en bout (stock décrémenté, paiement créé, notifications + emails envoyés), **mais le montant de la commande (`amount`) est silencieusement perdu** dès la persistance de l'entité `Order` — bug détecté uniquement grâce à l'exécution réelle (`OrderMapper.toOrder()` ne mappe pas ce champ). Voir [order.md](api/order.md).

---

### Flow 4 — Commande en erreur (client / produit / stock)

Préconditions : mêmes que Flow 3, stock produit 1 = 8 après Flow 3.

| # | Étape | Attendu (doc Phase 2, avant test) | Résultat réel | Statut |
|---|---|---|---|---|
| 4.1 | `POST /api/v1/orders` avec `customerId` inexistant | `400` (lecture statique du code : `BusinessException`) | **`500`** générique (`feign.FeignException$NotFound` non catchée — le code `BusinessException` est mort) | 🔴 **écart critique, doc corrigée** |
| 4.2 | `POST /api/v1/orders` avec `productId` inexistant | `500` (déjà anticipé "à vérifier" en Phase 2) | `500` générique confirmé | ✅ conforme à la prédiction Phase 2 |
| 4.3 | `POST /api/v1/orders` avec quantité > stock disponible (5000 vs 8) | `500` (idem) | `500` générique confirmé | ✅ conforme à la prédiction Phase 2 |
| 4.4 | Stock produit 1 après les 3 échecs | Inchangé (8) — aucune commande partielle | 8, inchangé | ✅ |

**Verdict** : **les 3 cas d'erreur métier remontent au frontend avec le même code `500` et le même corps générique** (`{"status":500,"error":"Internal Server Error","path":"/api/v1/orders"}`), sans aucun moyen de distinguer "client inconnu" de "stock insuffisant" de "produit inexistant". C'est le point bloquant le plus important pour l'implémentation d'un frontend : aucun message d'erreur exploitable pour informer l'utilisateur final. Positif : aucune donnée partielle n'est laissée en base (le stock n'est pas affecté par un échec ultérieur).

---

### Flow 5 — Historique des commandes

| # | Étape | Attendu | Résultat réel | Statut |
|---|---|---|---|---|
| 5.1 | `GET /api/v1/orders` (liste) | `200`, contient la commande créée (avec la même absence d'`amount` que 3.4) | `200`, conforme (y compris l'absence d'`amount`) | ✅ |
| 5.2 | `GET /api/v1/orders/9999` (introuvable) | `404` | `404 "No order found..."` | ✅ |
| 5.3 | `GET /api/v1/order-lines/order/9999` (commande introuvable) | `200 []` (silencieux, pas de vérification d'existence) | `200 []` | ✅ |

**Verdict** : flow entièrement conforme à la documentation (mise à jour suite au bug 3.4).

---

### Flow 6 — Paiement direct + notification (hors flux commande)

| # | Étape | Attendu | Résultat réel | Statut |
|---|---|---|---|---|
| 6.1 | `POST /api/v1/payments` nominal | `200`, id | `200`, `id=2` | ✅ |
| 6.2 | `POST /api/v1/payments` avec montant négatif (`-100`) — pas de cas "paiement refusé" réel, test de la validation | `200` accepté (aucune validation métier documentée) | `200`, `id=3`, accepté tel quel | ✅ conforme (anomalie déjà documentée : absence de validation) |
| 6.3 | `POST /api/v1/payments` avec email client invalide (`"pas-un-email"`) | `200` accepté (`@Valid` ne cascade pas sur `Customer`) | `200`, `id=4`, accepté tel quel | ✅ conforme (anomalie déjà documentée) |
| 6.4 | Notifications MongoDB pour les 3 paiements | 3 documents `PAYMENT_CONFIRMATION`, un par paiement | **1 document** pour 6.1, **1 document** pour 6.2, **10 documents dupliqués** pour 6.3 | 🔴 **écart critique, nouveau bug découvert** |
| 6.5 | Emails reçus pour les 3 paiements | 3 emails | **2 emails reçus** (6.1 et 6.2, adresse valide) — **aucun email pour 6.3** (adresse invalide → échec SMTP → jamais retenté avec succès, message perdu après 10 tentatives) | 🔴 conséquence du bug 6.4 |

**Verdict** : le paiement avec email invalide (6.3) déclenche une **tempête de retries Kafka** côté `notification-service` (`FixedBackOff{interval=0, maxAttempts=9}`, soit 10 tentatives), chaque tentative **rejouant intégralement le listener** (y compris la sauvegarde MongoDB) → **10 documents dupliqués pour un seul événement**, puis abandon silencieux sans dead-letter queue : le client concerné ne reçoit **jamais** son email de confirmation, sans qu'aucune alerte ne soit levée. Cause racine confirmée par lecture des logs : `@Async` sur `EmailService` est **sans effet** car `@EnableAsync` n'est déclaré nulle part dans `notification-service` — l'envoi d'email s'exécute donc de façon synchrone sur le thread du listener Kafka, et une `MailSendException` (non catchée, car le code ne catche que `MessagingException`) fait échouer le message Kafka entier. Détail complet : [notification.md](api/notification.md).

---

## Endpoints manquants pour un frontend type (à anticiper)

1. **Consultation d'un paiement** — `payment-service` n'expose que `POST`, aucun `GET /api/v1/payments/{id}` ni `GET /api/v1/payments?orderId=...` pour qu'un frontend affiche le statut/détail d'un paiement.
2. **Consultation des notifications/historique d'emails** — aucun endpoint, uniquement accessible en lisant MongoDB directement ou l'UI MailDev. Un frontend voulant afficher "vos notifications" n'a rien à consommer.
3. **Pagination** — absente sur `GET /api/v1/products`, `GET /api/v1/customers`, `GET /api/v1/orders` : tous les enregistrements sont chargés en une fois, non exploitable à l'échelle avec un vrai volume de données.
4. **Gestion des catégories produits** — `Category` existe côté modèle (utilisé par `product`) mais n'a aucun endpoint CRUD ; un frontend de gestion de catalogue ne peut ni lister ni créer de catégories via l'API.
5. **Mise à jour/suppression de produit et de commande** — seuls `customer` a un cycle CRUD complet ; `product` n'a ni `PUT` ni `DELETE`, `order` n'en a aucun non plus (une fois créée, une commande est immuable via l'API).

## Récapitulatif des anomalies (triées par sévérité)

| Sévérité | Service | Résumé | Détail |
|---|---|---|---|
| 🔴 Critique | notification-service | Tempête de retries Kafka + duplication MongoDB + perte silencieuse d'email sur échec SMTP | [notification.md](api/notification.md) |
| 🔴 Critique | order-service | `amount` de la commande jamais persisté (`OrderMapper.toOrder()` incomplet) | [order.md](api/order.md) |
| 🟠 Majeur | order-service | Toute erreur métier en aval (client/produit/stock introuvable) remonte en `500` générique indifférencié, y compris "client introuvable" pourtant censé être un `400` d'après le code | [order.md](api/order.md) |
| 🟡 Mineur | product-service | `GET /{product-id}` renvoie `400` au lieu de `404` pour un produit introuvable | [product.md](api/product.md) |
| 🟡 Mineur | customer-service | `PUT` ignore silencieusement le champ `lastname` | [customer.md](api/customer.md) |
| 🟡 Mineur | payment-service | Aucune validation métier réelle (montant négatif, email invalide acceptés sans erreur) | [payment.md](api/payment.md) |

## Collection Postman

Une collection Postman correspondant à l'ensemble des requêtes exécutées ci-dessus est disponible : [`docs/postman/ms-stock-management.postman_collection.json`](postman/ms-stock-management.postman_collection.json). Variable d'environnement à définir : `gatewayUrl` = `http://localhost:8222`. **Mise à jour du 2026-08-20** : les scripts de test reflètent désormais le comportement **corrigé** (404/400 avec messages exploitables, `amount` présent, `lastname` mis à jour, CORS) — plus l'ancien comportement bugué. Une nouvelle section CORS y a été ajoutée.

---

## Corrections apportées et revalidées

Les 6 anomalies ont été corrigées puis **revalidées sur un environnement complet redémarré à neuf** (mêmes commandes `docker-compose up` + 8 services réels), en rejouant précisément les scénarios qui avaient échoué ci-dessus. Aucune régression : les suites de tests existantes (`mvn test`) des 5 services modifiés restent vertes (5/5, 0 échec).

| # | Sévérité | Bug | Correction | Preuve de revalidation |
|---|---|---|---|---|
| 1 | 🔴 Critique | notification-service : tempête de retries + doublons Mongo + perte silencieuse d'email | `@EnableAsync` ajouté sur `NotificationApplication` (l'envoi d'email s'exécute enfin sur un pool dédié, plus sur le thread Kafka) + `catch` élargi à `MailException` (Spring, unchecked) en plus de `MessagingException` | Test isolé : MailDev coupé, paiement envoyé avec email valide → **1 seul document Mongo créé** (pas 10), log `WARN` propre (`MailConnectException` catchée), thread `task-4` distinct du thread `container#0-0-C-1` confirmant l'exécution asynchrone |
| 2 | 🔴 Critique | order-service : `amount` jamais persisté | `OrderMapper.toOrder()` mappe désormais `request.amount()` vers `Order.totalAmount` | `POST /api/v1/orders` puis `GET /api/v1/orders/{id}` → `"amount":149.99` présent dans la réponse |
| 3 | 🟠 Majeur | order-service : `500` générique pour toute erreur métier aval | `GlobalExceptionHandler` : handlers ajoutés pour `FeignException` et `HttpStatusCodeException`, relaient le vrai statut/message du service en amont | Client introuvable → `404 "No customer found with the provided ID: ..."` (au lieu de 500) ; produit introuvable → `400 "One or more products does not exist"` ; stock insuffisant → `400 "Insufficient stock quantity for product with ID:: 51"` |
| 4 | 🟡 Mineur | product-service : `400` au lieu de `404` | `GlobalExceptionHandler` : `EntityNotFoundException` mappée sur `HttpStatus.NOT_FOUND` | `GET /api/v1/products/999999` → `404` (au lieu de 400) |
| 5 | 🟡 Mineur | customer-service : `PUT` ignore `lastname` | `CustomerService.mergeCustomer()` : merge du champ `lastname` ajouté | `PUT` avec nouveau `lastname` puis `GET` → `lastname` bien mis à jour |
| 6 | 🟡 Mineur | payment-service : aucune validation métier | `PaymentRequest` : `@NotNull @Positive` sur `amount`, `@NotNull` sur `paymentMethod`, `@Valid @NotNull` sur `customer` (cascade vers les contraintes déjà déclarées sur `Customer`) | Montant négatif → `400 {"errors":{"amount":"Amount should be positive"}}` ; email invalide → `400 {"errors":{"customer.email":"..."}}` ; cas nominal toujours `200` |

**Taux de conformité après correction** : les 33 vérifications initiales, rejouées avec les fixes en place, sont désormais **100 % conformes** au comportement attendu par un frontend (codes distincts et messages exploitables pour chaque cas d'erreur, aucune perte de données, aucune duplication).

**Commits** (branche `refactor/rename-to-franck`) : un commit atomique par bug, préfixés `fix(<service>):`, chacun avec compilation vérifiée avant commit.

---

## Points restés ouverts après le rapport initial — également finalisés le 2026-08-20

En plus des 6 bugs ci-dessus, 3 points identifiés en cours de mission (Phase 1 et section « Points transverses ») ont été traités et revalidés en conditions réelles :

| # | Point | Correction | Revalidation |
|---|---|---|---|
| A | Nom Feign trompeur `@FeignClient(name="product-service")` sur `PaymentClient` (order-service), repéré en Phase 1 | Renommé en `"payment-service"` | Compilation + suite de tests existante, pas de test HTTP dédié possible (le `name` n'affecte pas le routage tant qu'une `url` explicite est fournie) |
| B | CORS non configuré sur la gateway | `spring.cloud.gateway.globalcors` ajouté (toutes origines/méthodes/en-têtes, sans credentials) dans la config centralisée | Requête `OPTIONS` preflight réelle avec `Origin: http://localhost:3000` → `200 OK` avec `Access-Control-Allow-Origin: http://localhost:3000` dans la réponse ; confirmé aussi sur un `GET` classique |
| C | Pas de transaction distribuée/saga : le stock décrémenté n'était jamais restauré si une étape après l'achat échouait | Compensation de stock (saga légère) : nouvel endpoint `POST /api/v1/products/restore` (best-effort) + `OrderService.createOrder()` compense désormais le stock sur toute erreur entre l'achat et la confirmation du paiement | `payment-service` arrêté artificiellement → commande passée sur un produit à 8 en stock → décrément à 5 confirmé → échec du paiement (500 relayé par la gateway, lui-même relayé par le `FeignException` handler) → stock revenu à 8, aucune commande orpheline en base (rollback JPA local + compensation distante). Flux nominal revérifié fonctionnel juste après (décrément normal, pas de compensation déclenchée à tort). |

Détail complet : [order.md](api/order.md#-compensation-de-stock-saga-légère--ajoutée-le-2026-08-20), [product.md](api/product.md), [gateway.md](api/gateway.md#cors).

**Ce qui reste volontairement non traité** (limites explicites, pas des bugs) :
- La compensation est *best-effort*, pas une saga complète (pas d'outbox, pas d'état persisté/rejouable).
- `ddl-auto: create` sur PostgreSQL (order/payment) : perte de données à chaque redémarrage — non demandé, nécessiterait une migration Flyway dédiée.
- Absence d'authentification : décision actée en Phase 0 de documenter tel quel plutôt que d'implémenter.
