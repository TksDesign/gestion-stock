# auth-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8095` |
| **Nom Eureka** | `AUTH-SERVICE` |
| **Base path (via gateway)** | `/api/v1/auth` (préfixe de route : `Path=/api/v1/auth/**`) |
| **Base de données** | MongoDB (`auth`, collection `users`) |
| **Authentification** | JWT (HS384, `io.jsonwebtoken` / jjwt 0.12.5). Seuls `/api/v1/auth/register` et `/api/v1/auth/login` sont publics ; `/me` et `/admin/**` nécessitent `Authorization: Bearer <token>` |
| **Package** | `com.franck.ecommerce.auth`, `com.franck.ecommerce.user`, `com.franck.ecommerce.config` |

Service d'authentification central. Émet les JWT consommés par `shop-service` (et à terme tout service protégé). Chaque inscription crée en cascade un `Customer` dans `customer-service` (appel REST via `CustomerClient`, best-effort — un échec n'empêche pas la création du compte).

## Rôles

| Rôle | Description | Comment le compte est créé |
|---|---|---|
| `CLIENT` | Acheteuse/acheteur du storefront e-commerce (panier, commandes, profil). **Rôle par défaut** de toute inscription publique. | `POST /register` (public) |
| `SHOP_MANAGER` | Gérante d'une boutique — accès à `shop-service` (`/shops/mine/**`). | `POST /admin/managers` (**admin uniquement**) — jamais via l'inscription publique |
| `ADMIN` | Gère toute l'application : création de boutiques, assignation/création de gérantes. | Aucun endpoint — seul le compte par défaut (voir ci-dessous) existe à ce jour |

Le rôle est encodé dans le claim JWT `role`, ainsi que `userId` (id Mongo de l'utilisateur) ; le `subject` (`sub`) du token est l'email.

✅ **Corrigé le 2026-09-17** : `POST /register` attribuait initialement `SHOP_MANAGER` à tout le monde (y compris un simple acheteur du storefront), ce qui n'avait aucun sens sémantique — un client qui s'inscrit pour acheter n'est pas une gérante de boutique. Désormais : inscription publique → `CLIENT` systématiquement ; la création d'un compte `SHOP_MANAGER` passe exclusivement par un admin via `POST /admin/managers` (voir plus bas), en amont de l'assignation à une boutique via `POST /shops` ([shop.md](shop.md)).

## Compte admin par défaut

Un `CommandLineRunner` (`DataInitializer`) crée automatiquement au premier démarrage, s'il n'existe pas déjà :

```
email    : admin@kshop.com
password : admin123
role     : ADMIN
```

Idempotent — vérifié via `existsByEmail` à chaque démarrage, ne recrée jamais de doublon.

## Modèle de données

### `User` (document Mongo, collection `users`)
| Champ | Type | Description |
|---|---|---|
| `id` | `String` | id Mongo |
| `firstname` | `String` | |
| `lastname` | `String` | |
| `email` | `String` | unique (index) |
| `password` | `String` | hashé BCrypt |
| `role` | `Role` (enum) | `ADMIN` \| `SHOP_MANAGER` \| `CLIENT` |
| `customerId` | `String` | id du `Customer` créé en cascade à l'inscription (nullable si l'appel à `customer-service` a échoué) |

### `RegisterRequest` (body — `POST /register`)
| Champ | Contrainte |
|---|---|
| `firstname` | `@NotBlank` |
| `lastname` | `@NotBlank` |
| `email` | `@NotBlank`, `@Email` |
| `password` | `@NotBlank`, `@Size(min=6)` |

### `AuthenticationRequest` (body — `POST /login`)
| Champ | Contrainte |
|---|---|
| `email` | `@NotBlank`, `@Email` |
| `password` | `@NotBlank` |

### `AuthenticationResponse` (réponse commune à `register`/`login`/`me`)
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "userId": "6aabb10eb9263d2ae8a90e31",
  "customerId": "6aabb41eea2f2d1435411d18",
  "firstname": "Marie",
  "lastname": "Dupont",
  "email": "marie@kshop.com",
  "role": "SHOP_MANAGER"
}
```
Sur `GET /me`, le champ `token` est `null` (non régénéré).

### `ErrorResponse`
`{ errors: { "<nomChamp ou 'error'>": "<message>" } }`

---

## `POST /api/v1/auth/register` — Créer un compte (storefront public)

- **Auth** : aucune (public)
- **Body** : `RegisterRequest`
- **Comportement** : crée le `User` (rôle forcé à `CLIENT`), tente de créer un `Customer` correspondant via `customer-service` (échec silencieux si le service est down — `customerId` reste `null`), retourne un JWT valide 24h (`expiration: 86400000` ms)
- **Réponse `201 Created`** : `AuthenticationResponse`
- **Réponse `400 Bad Request`** : `ErrorResponse` si validation échoue
- **Réponse `409 Conflict`** : `ErrorResponse` si l'email existe déjà (`{"error": "Email already in use"}`)

---

## `POST /api/v1/auth/admin/managers` — Créer un compte gérante (admin uniquement)

- **Auth** : requise, `@PreAuthorize("hasRole('ADMIN')")`
- **Body** (`CreateManagerRequest`) : `firstname*`, `lastname*`, `email*`, `password*` (mêmes contraintes que `RegisterRequest`)
- **Comportement** : crée le `User` avec `role: SHOP_MANAGER`, **sans** créer de `Customer` associé (une gérante n'est pas une acheteuse) — `customerId` reste `null` dans la réponse
- **Réponse `201 Created`** : `AuthenticationResponse` (contient un JWT valide, utilisable immédiatement — pratique pour transmettre les identifiants à la gérante)
- **Réponse `403 Forbidden`** : si l'appelant n'est pas `ADMIN` (y compris token absent)
- **Réponse `409 Conflict`** : si l'email existe déjà

**Flux recommandé côté admin** : `POST /admin/managers` (obtenir le `userId`) → `POST /api/v1/shops` avec ce `userId` comme `managerId` ([shop.md](shop.md#post-apiv1shops--créer-une-boutique-et-assigner-une-gérante)) pour créer la boutique et finaliser l'assignation.

---

## `POST /api/v1/auth/login` — Se connecter

- **Auth** : aucune (public)
- **Body** : `AuthenticationRequest`
- **Réponse `200 OK`** : `AuthenticationResponse`
- **Réponse `401 Unauthorized`** : `ErrorResponse` (`{"error": "Invalid email or password"}`) si mot de passe incorrect ou compte inexistant

---

## `GET /api/v1/auth/me` — Profil de l'utilisateur connecté

- **Auth** : requise (`Bearer <token>`)
- **Réponse `200 OK`** : `AuthenticationResponse` (`token: null`)
- **Réponse `401/403`** : si token absent, invalide ou expiré (géré par le filtre Spring Security, pas de body JSON custom)

---

## Sécurité — détails d'implémentation

- **Algorithme** : HS384, clé secrète Base64 partagée via `application.security.jwt.secret-key` (config-server, `auth-service.yml`). **La même clé est dupliquée dans `shop-service.yml`** pour permettre à `shop-service` de valider les tokens sans dépendre d'un appel réseau à `auth-service` (validation locale, stateless).
- **Expiration** : 24h (`application.security.jwt.expiration: 86400000`).
- **Filtre** : `JwtAuthenticationFilter` (`OncePerRequestFilter`) lit `Authorization: Bearer <token>`, extrait le `subject` (email), charge le `UserDetails` via `UserRepository.findByEmail`, valide la signature + expiration.
- **Beans de sécurité** séparés dans `ApplicationConfig` (userDetailsService, passwordEncoder, authenticationProvider, authenticationManager) — **volontairement isolés de `SecurityConfig`** pour éviter une dépendance circulaire Spring (`SecurityConfig` → `JwtAuthenticationFilter` → `UserDetailsService`, qui était initialement un `@Bean` de `SecurityConfig` lui-même → `BeanCurrentlyInCreationException` au démarrage). Voir historique de résolution dans le journal de session.

## Points d'attention

- **Aucun endpoint pour créer un compte `ADMIN`** : le seul admin existant est celui créé par `DataInitializer` au premier démarrage. Pour créer d'autres admins, il faut soit exposer un endpoint dédié protégé par rôle `ADMIN` (sur le même modèle que `POST /admin/managers`), soit insérer manuellement en base Mongo.
- **Pas de suppression/désactivation de compte** ni de changement de rôle a posteriori (pas de `PUT /admin/users/{id}/role`) — une gérante créée par erreur avec le mauvais rôle ne peut pas être corrigée via l'API.
- **`customerId` peut être `null`** si `customer-service` était indisponible à l'inscription — pas de mécanisme de rattrapage/retry a posteriori.
- **Pas de refresh token** : le JWT expire après 24h sans mécanisme de renouvellement ; l'utilisateur doit se reconnecter.
- **Pas de logout côté serveur** (JWT stateless, pas de blacklist) : la "déconnexion" est uniquement côté client (suppression du token stocké).
- **Le secret JWT est en clair dans `auth-service.yml`/`shop-service.yml`** (config-server, profil `native`) — à déplacer vers une variable d'environnement ou un vault avant toute mise en production.
