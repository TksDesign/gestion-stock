# gateway (api-gateway)

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8222` |
| **Nom Eureka** | `GATEWAY-SERVICE` (s'enregistre aussi comme client Eureka, en plus de router vers les autres) |
| **Technologie** | Spring Cloud Gateway (réactif, WebFlux) |
| **Authentification** | **Aucune au niveau de la gateway elle-même** — pas de filtre de sécurité, pas de vérification de token côté gateway (simple routeur transparent). Les services en aval (`auth-service`, `shop-service`) valident désormais le JWT **eux-mêmes** — voir [auth.md](auth.md) et [shop.md](shop.md). |
| **Package** | `com.franck.gateway` |

Point d'entrée unique attendu pour un frontend. C'est le seul composant que les tests de flow (Phase 3) doivent appeler — jamais les services directement.

## Routes déclarées explicitement (`gateway-service.yml`)

| Route id | Prédicat de chemin | Service cible (Eureka, load-balancé `lb://`) |
|---|---|---|
| `customer-service` | `/api/v1/customers/**` | `CUSTOMER-SERVICE` |
| `order-service` | `/api/v1/orders/**` | `ORDER-SERVICE` |
| `order-lines-service` | `/api/v1/order-lines/**` | `ORDER-SERVICE` |
| `product-service` | `/api/v1/products/**` | `PRODUCT-SERVICE` |
| `payment-service` | `/api/v1/payments/**` | `PAYMENT-SERVICE` |
| `auth-service` | `/api/v1/auth/**` | `AUTH-SERVICE` |
| `shop-service` | `/api/v1/shops/**` | `SHOP-SERVICE` |

Il n'y a **pas de route déclarée vers `notification-service`**, ce qui est cohérent : ce service n'expose aucun endpoint REST (voir [notification.md](notification.md)).

## CORS

`spring.cloud.gateway.globalcors` autorise toutes origines (`allowedOriginPatterns: "*"`) et toutes méthodes/en-têtes sur `/**` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` — ✅ `PATCH` ajouté le 2026-09-17, absent initialement, ce qui bloquait en `403` le preflight `OPTIONS` de tout endpoint `PATCH`, notamment `/shops/mine/sales/{id}/items/{id}/status`). **`allowCredentials: true`** depuis l'introduction de l'authentification JWT (nécessaire pour que le frontend puisse envoyer l'en-tête `Authorization` en cross-origin). `allowedOriginPatterns: "*"` reste compatible avec `allowCredentials: true` côté Spring (contrairement à `allowedOrigins: "*"`, qui l'interdirait).

## Découverte automatique de routes

`spring.cloud.gateway.discovery.locator.enabled: true` est activé : en plus des 5 routes ci-dessus, Spring Cloud Gateway **expose aussi automatiquement chaque service enregistré dans Eureka sous `/<NOM-SERVICE-EN-MINUSCULE>/**`** (ex. `http://localhost:8222/customer-service/api/v1/customers` fonctionnerait en plus de `http://localhost:8222/api/v1/customers`). Ce comportement est à garder en tête pour la Phase 3 : il existe potentiellement deux chemins d'accès différents pour le même endpoint.

## Agrégation Swagger

Aucune — le repo ne contient **aucune dépendance `springdoc-openapi`** dans les 8 modules (vérifié en Phase 0 et re-vérifié en Phase 2). Il n'existe donc :
- ni `/v3/api-docs` sur un service individuel,
- ni `/swagger-ui.html` / `/swagger-ui/index.html`,
- ni agrégation Swagger côté gateway.

La présente documentation (`docs/api/*.md`) est produite par lecture directe du code source (contrôleurs + DTOs + handlers d'exception), pas par extraction d'une spécification OpenAPI existante.

## Points d'attention

- ~~**CORS non configuré**~~ — ✅ corrigé (voir section dédiée ci-dessus).
- ~~**Aucune authentification/autorisation à aucun niveau**~~ — ✅ **partiellement corrigé** : `auth-service` (émission JWT) et `shop-service` (vérification JWT + rôles) sont protégés. **`customer`, `product`, `order`, `payment` restent totalement ouverts** — aucune vérification de token sur ces 4 services ni sur leurs routes gateway. Voir [auth.md](auth.md) et [shop.md](shop.md) pour le détail du nouveau flux.
- La gateway elle-même ne fait **aucune vérification de token** : elle route en aveugle vers `auth-service`/`shop-service`, qui appliquent leur propre filtre JWT en interne. Un WAF/filtre de gateway centralisé pourrait être ajouté plus tard pour éviter la duplication de la logique de validation entre `auth-service` et `shop-service` (actuellement dupliquée : même secret, même code `JwtService` copié dans les deux modules).
- La double exposition (route explicite + découverte automatique) peut prêter à confusion en observabilité (deux chemins pour le même endpoint) — sans impact fonctionnel direct.
