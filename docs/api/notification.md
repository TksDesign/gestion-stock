# notification-service

[⬅ Retour au sommaire](../API_DOCUMENTATION.md)

| | |
|---|---|
| **Port local** | `8040` |
| **Nom Eureka** | `NOTIFICATION-SERVICE` |
| **Base path (via gateway)** | Aucune — **ce service n'expose aucun endpoint REST** (pas de `@RestController` dans le code) |
| **Base de données** | MongoDB (`notification`) |
| **Authentification** | N/A |
| **Package** | `com.franck.ecommerce.notification`, `com.franck.ecommerce.kafka`, `com.franck.ecommerce.email` |

Ce service est un **pur consommateur asynchrone** : il écoute deux topics Kafka, persiste une trace de chaque notification en MongoDB, et envoie un email via MailDev (SMTP local). Il n'y a donc **rien à router depuis la gateway** vers ce service, et aucun endpoint à tester en HTTP direct — ce qui est cohérent avec l'absence de route `notification-service` dans `gateway-service.yml`.

## Ce qu'il consomme

| Topic Kafka | Producteur | Payload | Déclenché par |
|---|---|---|---|
| `order-topic` | `order-service` (`OrderProducer`) | `OrderConfirmation` | `POST /api/v1/orders` (fin de flux, après succès du paiement) |
| `payment-topic` | `payment-service` (`NotificationProducer`) | `PaymentConfirmation` | `POST /api/v1/payments` (juste après la sauvegarde du paiement) |

Le groupe de consommateur est configuré `group-id: paymentGroup,orderGroup` (un seul `@Service` `NotificationsConsumer` avec deux méthodes `@KafkaListener` distinctes, chacune sur son topic).

### `OrderConfirmation` (reçu sur `order-topic`)
`{ orderReference, totalAmount, paymentMethod, customer: {id, firstname, lastname, email}, products: [{productId, name, description, price, quantity}] }`

### `PaymentConfirmation` (reçu sur `payment-topic`)
`{ orderReference, amount, paymentMethod, customerFirstname, customerLastname, customerEmail }`

⚠️ Les deux DTOs sont **structurellement différents** bien qu'ils représentent tous deux un "événement de confirmation" (l'un porte un objet `customer` imbriqué, l'autre des champs plats `customerFirstname`/`customerLastname`/`customerEmail`) — cohérent avec le fait qu'ils proviennent de deux producteurs différents (`order-service` et `payment-service`) sans contrat d'événement partagé.

## Ce qu'il produit comme effet de bord

1. **Persistance MongoDB** : chaque message consommé crée un document `Notification` (`{id, type: ORDER_CONFIRMATION|PAYMENT_CONFIRMATION, notificationDate, orderConfirmation?, paymentConfirmation?}`). Il n'existe **aucun endpoint pour consulter cette collection** — les notifications ne sont visibles qu'en interrogeant Mongo directement (ex. via `mongo-express` sur `http://localhost:8081`).
2. **Envoi d'email** (asynchrone, `@Async`, via MailDev sur `localhost:1025`, UI de consultation sur `http://localhost:1080`) :
   - `payment-topic` → template `payment-confirmation.html` (sujet : voir `EmailTemplates`), expéditeur `contact@franckcoding.com`
   - `order-topic` → template `order-confirmation.html`, même expéditeur
   - ✅ **Corrigé le 2026-08-20** (bug #1, critique, du [rapport de tests](../TEST_REPORT.md#corrections-apportées-et-revalidées)) : le `catch` couvre désormais `MailException` (Spring, unchecked) en plus de `MessagingException` (checked). Voir la section ci-dessous pour l'historique complet du bug.

## ✅ Bug critique corrigé le 2026-08-20 : tempête de retries Kafka + doublons MongoDB sur échec d'email

**Cause racine (diagnostiquée en Phase 3)** : `EmailService.sendPaymentSuccessEmail`/`sendOrderConfirmationEmail` sont annotées `@Async`, mais **`@EnableAsync` n'était déclaré nulle part dans `notification-service`**. En l'absence de cette annotation, Spring ignorait silencieusement `@Async` : la méthode s'exécutait **de façon synchrone, sur le thread même du listener Kafka**, au lieu d'être déportée sur un pool dédié.

**Chaîne d'événements observée avant correction** (payload `payment-topic` avec un email client invalide, ex. `"pas-un-email"`) :
1. Le listener `consumePaymentSuccessNotifications` sauvegardait la `Notification` en MongoDB, puis appelait `sendPaymentSuccessEmail` **de façon synchrone** (à cause du bug ci-dessus).
2. `mailSender.send(...)` échouait avec `MailSendException` (adresse invalide, SMTP 501) — **exception non catchée** (le `catch (MessagingException e)` ne matchait pas ce type).
3. L'exception remontait jusqu'au conteneur Kafka (`KafkaMessageListenerContainer`), qui considérait le message comme non traité.
4. Le `DefaultErrorHandler` de Spring Kafka **relisait et rejouait le message depuis le début** (`Seek to current after exception`), donc **ré-exécutait toute la méthode, y compris la sauvegarde MongoDB**.
5. Ce cycle se répétait **10 fois** (`FixedBackOff{interval=0, maxAttempts=9}`, backoff par défaut de Spring Kafka), créant **10 documents `Notification` dupliqués en base pour un seul événement métier**.
6. Après épuisement des tentatives, le message était abandonné **sans dead-letter queue configurée** — le client concerné **ne recevait jamais son email**, silencieusement, sans aucune alerte exploitable.

**Correctifs appliqués** :
1. `@EnableAsync` ajouté sur `NotificationApplication` — l'envoi d'email s'exécute désormais réellement sur un pool async dédié.
2. `catch` élargi à `MailException` (classe parente Spring de `MailSendException`) en plus de `MessagingException` — défense en profondeur pour ne jamais laisser une erreur d'envoi remonter jusqu'au conteneur Kafka, même dans un scénario où `@Async` serait un jour désactivé.

**Revalidation** : MailDev arrêté (panne SMTP simulée, email syntaxiquement valide pour isoler le test du fix #6 côté `payment-service`) → paiement envoyé → **1 seul document Mongo créé** (au lieu de 10), log `WARN` propre (`MailConnectException` catchée), thread `task-4` observé dans les logs (distinct du thread `container#0-0-C-1` du listener Kafka), confirmant l'exécution asynchrone.

**Non fait** (au-delà du périmètre des 6 bugs, à considérer séparément si souhaité) : configurer un `DeadLetterPublishingRecoverer` pour tracer/rejouer plus tard les messages qui échoueraient malgré tout après plusieurs tentatives (filet de sécurité supplémentaire, non nécessaire pour corriger le bug tel que diagnostiqué).

## Points d'attention

- Pas d'endpoint HTTP → impossible de vérifier via un appel API qu'une notification a bien été traitée ; seule option d'observation : lire MongoDB directement ou l'UI MailDev (`http://localhost:1080`).
- Constat de lecture de code (non re-testé isolément en Phase 3) : le `group-id` `paymentGroup,orderGroup` (avec une virgule) est probablement une **seule** valeur de group id littérale contenant une virgule (Spring ne découpe pas automatiquement une propriété `String` sur la virgule) — sans impact fonctionnel avéré ici (un seul `@Service` consommateur), mais à vérifier si un jour le traitement de `order-topic` et `payment-topic` doit être scalé indépendamment.
