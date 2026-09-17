# customer-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8090` |
| **Nom Eureka** | `CUSTOMER-SERVICE` |
| **Base path (via gateway)** | `/api/v1/customers` (préfixe de route : `Path=/api/v1/customers/**`) |
| **Base de données** | MongoDB (`customer`) |
| **Authentification** | Aucune — pas de dépendance Spring Security dans le repo, tous les endpoints sont ouverts |
| **Package** | `com.franck.ecommerce.customer` |

Gère le référentiel clients (CRUD). Consommé de façon synchrone par `order-service` (`CustomerClient`, Feign) pour valider l'existence d'un client et récupérer ses coordonnées avant de créer une commande.

## Modèle de données

### `CustomerRequest` (body — POST/PUT)
| Champ | Type | Contrainte | Description |
|---|---|---|---|
| `id` | `String` | — | Identifiant Mongo (`ObjectId` en `String`). Requis pour `PUT`, ignoré pour `POST` (généré). |
| `firstname` | `String` | `@NotNull` | Prénom du client |
| `lastname` | `String` | `@NotNull` | Nom du client |
| `email` | `String` | `@NotNull`, `@Email` | Email du client |
| `address` | `Address` | optionnel | Adresse (voir ci-dessous) |

### `Address`
| Champ | Type |
|---|---|
| `street` | `String` |
| `houseNumber` | `String` |
| `zipCode` | `String` |

### `CustomerResponse` (réponse — GET)
`{ id, firstname, lastname, email, address }`

### `ErrorResponse` (erreur de validation — 400)
`{ errors: { "<nomChamp>": "<message>" } }`

---

## `POST /api/v1/customers` — Créer un client

- **Auth** : aucune
- **Body** : `CustomerRequest` (`@Valid`)
- **Réponse `200 OK`** : `String` — l'`id` Mongo généré (ex. `"66f1a2b3c4d5e6f7a8b9c0d1"`), renvoyé tel quel (pas d'objet JSON, juste une chaîne)
- **Réponse `400 Bad Request`** : `ErrorResponse` si `firstname`/`lastname`/`email` manquants ou email mal formé

**Exemple de requête**
```http
POST /api/v1/customers HTTP/1.1
Content-Type: application/json

{
  "firstname": "Franck",
  "lastname": "Tchana",
  "email": "franck.tchana@example.com",
  "address": { "street": "Rue de la Paix", "houseNumber": "12", "zipCode": "75002" }
}
```
**Réponse 200**
```json
"66f1a2b3c4d5e6f7a8b9c0d1"
```

---

## `PUT /api/v1/customers` — Mettre à jour un client

- **Auth** : aucune
- **Body** : `CustomerRequest` (`@Valid`) — **`id` obligatoire dans le body** (pas de `{customer-id}` dans l'URL ; design non-RESTful à noter)
- **Comportement** : mise à jour partielle — `firstname`, `lastname`, `email` et `address` sont fusionnés s'ils sont non vides. ✅ **Corrigé le 2026-08-20** : `lastname` était auparavant accepté par le DTO mais jamais appliqué par `CustomerService.mergeCustomer` (bug #5 du [rapport de tests](../TEST_REPORT.md#corrections-apportées-et-revalidées)) — le merge est désormais complet.
- **Réponse `202 Accepted`** : corps vide
- **Réponse `400 Bad Request`** : `ErrorResponse` si le body ne respecte pas les contraintes `@NotNull`/`@Email` (mêmes règles qu'à la création, y compris sur un update partiel)
- **Réponse `404 Not Found`** : texte brut (ex. `"Cannot update customer:: No customer found with the provided ID: <id>"`) si `id` ne correspond à aucun client

---

## `GET /api/v1/customers` — Lister tous les clients

- **Auth** : aucune
- **Réponse `200 OK`** : `CustomerResponse[]` (peut être vide `[]`)

---

## `GET /api/v1/customers/{customer-id}` — Récupérer un client

- **Path param** : `customer-id` (`String`)
- **Réponse `200 OK`** : `CustomerResponse`
- **Réponse `404 Not Found`** : texte brut (ex. `"No customer found with the provided ID: <id>"`)

---

## `GET /api/v1/customers/exists/{customer-id}` — Vérifier l'existence d'un client

- **Path param** : `customer-id` (`String`)
- **Réponse `200 OK`** : `Boolean` (`true`/`false`) — ne renvoie jamais 404, toujours 200 avec `false` si absent

---

## `DELETE /api/v1/customers/{customer-id}` — Supprimer un client

- **Path param** : `customer-id` (`String`)
- **Réponse `202 Accepted`** : corps vide, **même si l'id n'existe pas** (`repository.deleteById` de Spring Data ne lève pas d'exception sur un id absent en MongoDB — aucune vérification d'existence n'est faite côté service, donc pas de 404 possible ici)

---

## Points d'attention

- ~~`PUT` ignore silencieusement `lastname`~~ — ✅ corrigé (voir ci-dessus).
- `DELETE` ne renvoie jamais `404`, même sur un id inexistant (comportement volontairement laissé tel quel — non listé comme bug à corriger).
- Aucune vérification n'existe qu'un client n'a pas de commandes en cours avant suppression (pas d'appel vers `order-service`).
- Aucune pagination sur `GET /api/v1/customers` (tous les documents Mongo sont chargés en mémoire).
