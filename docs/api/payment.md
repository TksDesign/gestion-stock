# payment-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8060` |
| **Nom Eureka** | `PAYMENT-SERVICE` |
| **Base path (via gateway)** | `/api/v1/payments` |
| **Base de données** | PostgreSQL (`payment`), `ddl-auto: create` (schéma recréé à chaque démarrage) |
| **Authentification** | Aucune |
| **Package** | `com.franck.ecommerce.payment` |

Enregistre un paiement et publie un événement Kafka (`payment-topic`) consommé par `notification-service` pour l'email de confirmation. Appelé de façon synchrone par `order-service` (Feign) à la fin du flux de création de commande.

⚠️ **Il n'existe aucune intégration avec un prestataire de paiement réel** (pas de Stripe/PayPal SDK, pas d'appel externe). `createPayment` **enregistre systématiquement le paiement en base et retourne un succès** — il n'y a **aucun cas de "paiement refusé"** dans le code actuel. Un flow de test "paiement refusé" (évoqué dans le brief comme cas d'erreur à couvrir) ne peut donc pas être exercé sans modifier le code : à signaler explicitement en Phase 3.

## Modèle de données

### `PaymentRequest` (body — POST)
| Champ | Type | Contrainte |
|---|---|---|
| `id` | `Integer` | ignoré (généré) |
| `amount` | `BigDecimal` | `@NotNull @Positive` — ✅ **corrigé le 2026-08-20** (bug #6 du [rapport de tests](../TEST_REPORT.md#corrections-apportées-et-revalidées)), un montant négatif ou nul est désormais rejeté en `400` |
| `paymentMethod` | `PaymentMethod` (enum : `PAYPAL`, `CREDIT_CARD`, `VISA`, `MASTER_CARD`, `BITCOIN`) | `@NotNull` (idem, corrigé) |
| `orderId` | `Integer` | aucune contrainte, aucune vérification que la commande existe réellement (non concerné par le fix) |
| `orderReference` | `String` | aucune |
| `customer` | `Customer` (`{id, firstname, lastname, email}`) | `@NotNull @Valid` — ✅ corrigé : les contraintes `@NotNull`/`@Email` du record `Customer` étaient déclarées mais jamais évaluées faute de cascade (`@Valid` manquant sur ce champ) ; elles sont désormais bien déclenchées (ex. email invalide → `400 {"errors":{"customer.email":"..."}}`) |

---

## `POST /api/v1/payments` — Enregistrer un paiement

- **Auth** : aucune
- **Body** : `PaymentRequest` (`@Valid` — mais voir limites de validation ci-dessus)
- **Comportement** :
  1. Sauvegarde l'entité `Payment` en PostgreSQL
  2. Publie un message `PaymentNotificationRequest` sur le topic Kafka `payment-topic` (fire-and-forget, aucun impact sur la réponse HTTP même si Kafka est indisponible au moment de l'appel — `KafkaTemplate.send` est asynchrone)
- **Réponse `200 OK`** : `Integer` — l'`id` du paiement créé
- **Réponse `400 Bad Request`** : `ErrorResponse` (`{errors: {champ: message}}`) si le body est structurellement invalide, ou si `amount`/`paymentMethod`/`customer` (et les champs de `customer`) ne respectent pas leurs contraintes — voir modèle de données ci-dessus (validé le 2026-08-20)

**Exemple**
```http
POST /api/v1/payments HTTP/1.1
Content-Type: application/json

{
  "amount": 199.98,
  "paymentMethod": "CREDIT_CARD",
  "orderId": 14,
  "orderReference": "CMD-2026-0001",
  "customer": { "id": "66f1a2b3c4d5e6f7a8b9c0d1", "firstname": "Franck", "lastname": "Tchana", "email": "franck.tchana@example.com" }
}
```
```json
7
```

---

## Points d'attention

- **Aucun cas "paiement refusé" implémentable** : le flow métier attendu par un frontend (paiement refusé/carte invalide) n'existe pas côté backend actuellement — c'est un endpoint qui, pour toute requête syntaxiquement/structurellement valide, retourne toujours 200 (non concerné par les 6 bugs corrigés, comportement volontairement laissé tel quel).
- ~~Validation quasi absente sur `PaymentRequest`~~ — ✅ corrigé (voir ci-dessus). `orderId`/`orderReference` restent non contraints (non signalé comme bug).
- Pas d'endpoint `GET` pour consulter un paiement ou l'historique des paiements d'une commande (endpoint manquant identifié, voir [TEST_REPORT.md](../TEST_REPORT.md)).
