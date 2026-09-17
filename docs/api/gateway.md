# gateway (api-gateway)

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8222` |
| **Nom Eureka** | `GATEWAY-SERVICE` (s'enregistre aussi comme client Eureka, en plus de router vers les autres) |
| **Technologie** | Spring Cloud Gateway (réactif, WebFlux) |
| **Authentification** | **Aucune** — pas de filtre de sécurité, pas de vérification de token, aucun endpoint n'est protégé au niveau de la gateway ni des services en aval |
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

Il n'y a **pas de route déclarée vers `notification-service`**, ce qui est cohérent : ce service n'expose aucun endpoint REST (voir [notification.md](notification.md)).

## CORS

✅ **Configuré le 2026-08-20** (voir « Points d'attention » historique ci-dessous). `spring.cloud.gateway.globalcors` autorise toutes origines/méthodes/en-têtes sur `/**`, sans `allowCredentials` (cohérent avec l'absence totale d'authentification dans ce backend). Revalidé par une requête `OPTIONS` preflight réelle avec `Origin: http://localhost:3000` → `Access-Control-Allow-Origin` correctement renvoyé dans la réponse.

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
- Aucune authentification/autorisation à aucun niveau (gateway ou services) : à considérer comme un point bloquant si le frontend doit gérer des comptes utilisateurs différenciés (voir décision actée en Phase 0 : documenté tel quel, hors périmètre de cette mission).
- La double exposition (route explicite + découverte automatique) peut prêter à confusion en observabilité (deux chemins pour le même endpoint) — sans impact fonctionnel direct.
