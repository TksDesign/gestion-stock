# KSHOP — Plateforme e-commerce microservices

KSHOP est une plateforme e-commerce complète construite en architecture microservices : un backend Spring Boot (10 services) et deux frontends (React et Angular, tous deux complets et interchangeables) qui parlent au même backend via une gateway unique.

L'application gère trois profils utilisateurs :
- **Client** : parcourt le catalogue, achète, suit ses commandes.
- **Gérante de boutique** (`SHOP_MANAGER`) : gère sa boutique, son stock, ses ventes (caisse + commandes en ligne).
- **Admin** : gère l'ensemble de l'application — création de boutiques, gérantes, clients.

Ce document explique comment installer le projet de zéro, comment il est architecturé, et comment les différentes parties communiquent entre elles.

---

## Sommaire

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Prérequis](#2-prérequis)
3. [Installation et démarrage rapide](#3-installation-et-démarrage-rapide)
4. [Détail des services backend](#4-détail-des-services-backend)
5. [Infrastructure (bases de données, Kafka, monitoring)](#5-infrastructure-bases-de-données-kafka-monitoring)
6. [Frontends](#6-frontends)
7. [Comment les services communiquent entre eux](#7-comment-les-services-communiquent-entre-eux)
8. [Authentification et rôles](#8-authentification-et-rôles)
9. [Gestion des erreurs](#9-gestion-des-erreurs)
10. [Comptes de test](#10-comptes-de-test)
11. [Scripts utiles](#11-scripts-utiles)
12. [Arborescence du projet](#12-arborescence-du-projet)
13. [Documentation complémentaire](#13-documentation-complémentaire)
14. [Dépannage](#14-dépannage)

---

## 1. Vue d'ensemble de l'architecture

```
                                   ┌─────────────────────┐
                                   │   Frontend React     │  (localhost:5173)
                                   │   ou Frontend Angular │  (localhost:4300)
                                   └──────────┬───────────┘
                                              │ HTTP (REST + JWT)
                                              ▼
                                   ┌─────────────────────┐
                                   │   Gateway (8222)     │  Spring Cloud Gateway
                                   │   routage + CORS      │
                                   └──────────┬───────────┘
                                              │
                    ┌──────────┬──────────┬───┴──────┬──────────┬──────────┐
                    ▼          ▼          ▼           ▼          ▼          ▼
                 auth       shop       order       payment    product   customer
                 :8095      :8100      :8070        :8060      :8050      :8090
                    │          │          │           │          │          │
                    └──────────┴────┬─────┴───────────┴──────────┴──────────┘
                                     │ s'enregistrent auprès de
                                     ▼
                          ┌─────────────────────┐
                          │  Discovery (8761)     │  Eureka — annuaire de services
                          └─────────────────────┘
                                     ▲
                                     │ lisent leur config depuis
                          ┌─────────────────────┐
                          │ Config Server (8888)  │  configuration centralisée
                          └─────────────────────┘

          notification (:8040) écoute Kafka en tâche de fond (emails de confirmation)
```

**Le principe** : chaque service métier est une petite application Spring Boot indépendante, avec sa propre base de données. Ils ne se connaissent pas directement — ils s'enregistrent auprès du **Discovery** (Eureka) et vont chercher leur configuration au démarrage auprès du **Config Server**. Le frontend ne parle jamais directement à un service : il passe systématiquement par la **Gateway**, qui route chaque requête vers le bon service et gère le CORS.

---

## 2. Prérequis

| Outil | Version | Pourquoi |
|---|---|---|
| **JDK** | 17 | Requis par tous les services Spring Boot (`java.version=17` dans les `pom.xml`). Le projet ne compile pas avec JDK 21+ à cause de Lombok. |
| **Maven** | fourni | Chaque service embarque son propre wrapper (`mvnw` / `mvnw.cmd`) — pas besoin d'installer Maven séparément. |
| **Docker + Docker Compose** | récent | Fait tourner PostgreSQL, MongoDB, Kafka/Zookeeper, Zipkin, pgAdmin, Mongo Express, MailDev. |
| **Node.js** | 20+ (testé en 24) | Pour les deux frontends. |
| **npm** | fourni avec Node | Gestionnaire de paquets frontend. |
| **Git Bash** (sous Windows) | — | Les scripts `start-backend.sh` / `stop-backend.sh` sont des scripts bash. |

Vérifier que le JDK 17 est bien celui utilisé (et pas une version plus récente installée par ailleurs) :

```bash
java -version   # doit afficher 17.x
```

Si ce n'est pas le cas, installez un JDK 17 (ex. Eclipse Temurin) et définissez `JAVA_HOME` vers celui-ci avant de lancer les scripts.

---

## 3. Installation et démarrage rapide

### 3.1 Cloner et se placer à la racine

```bash
cd gestion-stock
```

### 3.2 Démarrer tout le backend en une commande

Le script `start-backend.sh` fait tout le travail : il lance l'infrastructure Docker, compile les 10 services Java, puis les démarre dans le bon ordre (config-server et discovery en premier, car les autres en dépendent).

```bash
bash start-backend.sh
```

Ce que fait le script, dans l'ordre :
1. Arrête toute instance déjà en cours sur les ports utilisés.
2. Démarre l'infrastructure Docker (`docker compose up -d`) : PostgreSQL, MongoDB, Kafka, Zookeeper, Zipkin, pgAdmin, Mongo Express, MailDev.
3. Attend l'initialisation des bases de données (15s).
4. Compile chaque service (`mvnw clean install -DskipTests`).
5. Démarre chaque service l'un après l'autre avec un délai d'attente adapté (config-server et discovery ont besoin de plus de temps pour être prêts avant que les autres ne s'enregistrent).
6. Écrit les logs de chaque service dans `logs/<nom-service>.log`.

Comptez **2 à 4 minutes** pour un premier démarrage (compilation + téléchargement des images Docker).

### 3.3 Vérifier que tout est démarré

```bash
curl http://localhost:8222/api/v1/auth/login -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@kshop.com","password":"admin123"}'
```

Une réponse contenant un `token` confirme que la gateway, le service d'auth et sa base MongoDB sont opérationnels.

Pour surveiller un service en particulier pendant son démarrage :

```bash
tail -f logs/shop.log
```

### 3.4 Arrêter le backend proprement

```bash
bash stop-backend.sh
```

Arrête les 10 services Java puis l'infrastructure Docker.

### 3.5 Démarrer un frontend

Choisissez **l'un des deux** (ils sont fonctionnellement identiques, portés l'un depuis l'autre) :

```bash
# React (Vite) — http://localhost:5173
cd frontend
npm install
npm run dev
```

```bash
# Angular — http://localhost:4300
cd frontend-angular
npm install
npm start
```

Les deux frontends pointent par défaut sur la gateway à `http://localhost:8222` (configurable via `VITE_API_GATEWAY_URL` pour React, `environment.ts` pour Angular).

---

## 4. Détail des services backend

| Service | Port | Rôle | Base de données |
|---|---|---|---|
| **config-server** | 8888 | Sert la configuration centralisée (fichiers YAML dans `services/config-server/src/main/resources/configurations/`) à tous les autres services au démarrage. | — |
| **discovery** | 8761 | Annuaire de services (Eureka). Chaque service s'y enregistre ; la gateway et Feign l'utilisent pour trouver les instances par nom logique (`AUTH-SERVICE`, `SHOP-SERVICE`, …). Interface web sur `http://localhost:8761`. | — |
| **gateway** | 8222 | Point d'entrée unique du backend. Route chaque `/api/v1/...` vers le bon service (`lb://` = load-balanced via Eureka), gère le CORS pour le frontend, et centralise la gestion des pannes en aval (503/504 avec message clair au lieu d'une erreur brute). | — |
| **auth** | 8095 | Inscription, connexion, émission des JWT. Gère les rôles `ADMIN` / `SHOP_MANAGER` / `CLIENT`. Crée un admin par défaut au premier démarrage. | MongoDB |
| **customer** | 8090 | Fiches clients (nom, adresse) associées à un compte auth. | MongoDB |
| **product** | 8050 | Ancien catalogue produits (historique — voir `shop`, qui l'a remplacé pour le catalogue public). | PostgreSQL |
| **shop** | 8100 | Le service le plus complet : boutiques, stock, ventes, catalogue public, catégories, tableau de bord gérante. Contient le catalogue produit actuel (a absorbé le rôle de `product-service`). | PostgreSQL |
| **order** | 8070 | Création et suivi des commandes clients. Appelle `customer-service` (Feign) pour valider le client, et le catalogue de `shop-service` (RestTemplate) pour l'achat, puis publie un événement Kafka de confirmation. | PostgreSQL |
| **payment** | 8060 | Paiement (simulé — aucune vraie passerelle de paiement n'est intégrée). | PostgreSQL |
| **notification** | 8040 | Ne sert aucune API REST : écoute en tâche de fond le topic Kafka `order-topic` et envoie un email de confirmation via MailDev. | MongoDB |

Chaque service est un module Maven indépendant sous `services/<nom>/`, avec son propre `pom.xml` et son propre wrapper Maven (`./mvnw`).

---

## 5. Infrastructure (bases de données, Kafka, monitoring)

Définie dans `docker-compose.yml`, démarrée automatiquement par `start-backend.sh` :

| Conteneur | Port hôte | Usage | Identifiants par défaut |
|---|---|---|---|
| `ms_pg_sql` (PostgreSQL) | 5433 | Bases relationnelles : `shop`, `order`, `payment`, `product` | `franck` / `franck` |
| `ms_pgadmin` | 5050 | Interface web d'administration PostgreSQL | `pgadmin4@pgadmin.org` / `admin` |
| `mongo_db` (MongoDB) | 27017 | Bases documents : `auth`, `customer`, `notification` | `franck` / `franck` |
| `mongo_express` | 8081 | Interface web d'administration MongoDB | — |
| `zookeeper` + `ms_kafka` (Kafka) | 9092 | Bus d'événements asynchrone (commandes → notification) | — |
| `zipkin` | 9411 | Traçage distribué des requêtes entre microservices (`http://localhost:9411`) | — |
| `ms-mail-dev` (MailDev) | 1080 (web), 1025 (SMTP) | Attrape les emails envoyés par `notification-service` — les consulter sur `http://localhost:1080` | — |

Ces identifiants sont ceux du fichier `docker-compose.yml` ; ils peuvent être surchargés via des variables d'environnement (`POSTGRES_USER`, `MONGO_INITDB_ROOT_USERNAME`, etc.) si besoin.

---

## 6. Frontends

Le projet contient **deux implémentations frontend strictement équivalentes** :

| | `frontend/` (React) | `frontend-angular/` (Angular) |
|---|---|---|
| Framework | React 18 + Vite | Angular 22 (standalone components + Signals) |
| État global | Zustand | NgRx (store + actions + reducers + selectors) |
| Style | Tailwind CSS v4 | Tailwind CSS v4 |
| Appels API | Axios (intercepteurs JWT + erreurs) | `HttpClient` (intercepteurs fonctionnels JWT + erreurs) |
| Port dev | 5173 | 4300 |
| Démarrage | `npm run dev` | `npm start` |

Les deux couvrent les mêmes trois espaces :
- **Public / Client** : accueil, catalogue, fiche produit, panier, checkout, profil, favoris.
- **Espace Gérante** (`/manager/...`) : tableau de bord, stock, ventes (caisse + commandes en ligne), paramètres boutique.
- **Espace Admin** (`/admin/...`) : boutiques, gérantes, clients.

---

## 7. Comment les services communiquent entre eux

- **Frontend → backend** : toujours via la **gateway** (`http://localhost:8222`), jamais directement vers un service. La gateway route selon le préfixe de chemin (ex. `/api/v1/shops/**` → `shop-service`).
- **Service → service (synchrone)** : via **Feign Client** (ex. `order-service` appelle `customer-service` pour vérifier qu'un client existe) ou **RestTemplate** (ex. `order-service` appelle le catalogue de `shop-service` pour l'achat). Les deux résolvent l'adresse réelle du service cible via **Eureka**.
- **Service → service (asynchrone)** : via **Kafka**. Quand une commande est créée, `order-service` publie un message sur le topic `order-topic`. Deux consommateurs indépendants l'écoutent :
  - `notification-service` → envoie un email de confirmation.
  - `shop-service` → enregistre la vente correspondante pour la boutique concernée (pour que la gérante la voie dans son tableau de bord).
- **Configuration** : tous les services (sauf `config-server` lui-même) démarrent avec `spring.config.import=configserver:http://localhost:8888` et vont chercher leur fichier `<nom-service>.yml` dans `services/config-server/src/main/resources/configurations/` au démarrage.

---

## 8. Authentification et rôles

- Authentification par **JWT** (HS384), émis par `auth-service` à la connexion (`POST /api/v1/auth/login`).
- Le frontend stocke le token et l'envoie dans l'en-tête `Authorization: Bearer <token>` sur chaque requête (intercepteur HTTP).
- Trois rôles : `CLIENT` (par défaut à l'inscription), `SHOP_MANAGER` (créé uniquement par un admin), `ADMIN`.
- Les routes protégées par rôle utilisent `@PreAuthorize("hasRole('ADMIN')")` côté backend (Spring Security), et des gardes de route équivalentes côté frontend (React : `ProtectedRoute` ; Angular : `protectedGuard`).
- Un compte admin par défaut est créé automatiquement au premier démarrage d'`auth-service` s'il n'existe pas déjà (voir [Comptes de test](#10-comptes-de-test)).

---

## 9. Gestion des erreurs

Tous les services backend renvoient désormais un format d'erreur JSON uniforme :

```json
{ "timestamp": "2026-09-18T10:00:00Z", "status": 404, "errors": { "error": "message explicite" } }
```

ou, pour une erreur de validation (champ par champ) :

```json
{ "timestamp": "...", "status": 400, "errors": { "email": "Email is required", "password": "Password is required" } }
```

- **401** (non authentifié) et **403** (rôle insuffisant) sont interceptés au niveau de Spring Security (`auth-service` et `shop-service`, les deux seuls à avoir une configuration de sécurité) et renvoient ce même format.
- **500** (erreur inattendue) : un filet de sécurité (`@ExceptionHandler(Exception.class)`) capture tout ce qui n'est pas prévu explicitement, log la stack trace complète côté serveur, et renvoie un message générique côté client (aucune fuite de détail interne).
- **Gateway** : si un service en aval est indisponible ou trop lent, la gateway renvoie une erreur 503/504 avec ce même format JSON plutôt qu'une page d'erreur générique illisible.

---

## 10. Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@kshop.com` | `admin123` |
| Gérante (boutique "Boutique Marie") | `marie@kshop.com` | `marie123` |

D'autres comptes gérantes/clients peuvent exister selon les données déjà créées en base — utilisez l'espace admin (`/admin/managers`, `/admin/clients`) pour les lister, ou créez-en de nouveaux via `/admin/shops` (création boutique + gérante) ou l'inscription publique (client).

---

## 11. Scripts utiles

| Commande | Effet |
|---|---|
| `bash start-backend.sh` | Démarre l'infrastructure Docker + les 10 services backend. |
| `bash stop-backend.sh` | Arrête les 10 services backend puis l'infrastructure Docker. |
| `tail -f logs/<service>.log` | Suit les logs d'un service en direct (ex. `logs/shop.log`, `logs/gateway.log`). |
| `cd services/<nom> && ./mvnw clean compile` | Recompile un seul service (utile après une modification, sans tout redémarrer). |

---

## 12. Arborescence du projet

```
gestion-stock/
├── services/                  # 10 microservices Spring Boot
│   ├── config-server/         # configuration centralisée
│   ├── discovery/              # annuaire Eureka
│   ├── gateway/                 # point d'entrée unique
│   ├── auth/                    # authentification, JWT, rôles
│   ├── customer/                # fiches clients
│   ├── shop/                    # boutiques, stock, ventes, catalogue
│   ├── order/                   # commandes
│   ├── payment/                 # paiement (simulé)
│   ├── product/                 # ancien catalogue (historique)
│   └── notification/            # emails via Kafka
├── frontend/                  # SPA React (Vite + Zustand + Tailwind)
├── frontend-angular/          # SPA Angular (NgRx + Tailwind)
├── docker-compose.yml         # infrastructure (BDD, Kafka, monitoring)
├── start-backend.sh           # démarre tout le backend
├── stop-backend.sh            # arrête tout le backend
├── logs/                      # logs de chaque service (généré à l'exécution)
├── docs/                      # documentation API détaillée, rapports de tests
└── README.md                  # ce fichier
```

---

## 13. Documentation complémentaire

- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) — détail de tous les endpoints REST, requêtes/réponses.
- [`docs/api/`](docs/api) — documentation API par service.
- [`docs/postman/`](docs/postman) — collection Postman pour tester l'API manuellement.
- [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) — rapport de tests et bugs historiques corrigés.

---

## 14. Dépannage

**Le backend ne démarre pas / erreurs de compilation Lombok**
→ Vérifiez que `JAVA_HOME` pointe vers un **JDK 17** (pas 21+, pas 8). `java -version` doit afficher `17.x`.

**Un service reste bloqué sur un port déjà utilisé**
→ `bash stop-backend.sh` puis relancer. Le script tue automatiquement toute instance déjà en cours sur les ports connus avant de redémarrer.

**Le frontend affiche des erreurs réseau / CORS**
→ Vérifiez que la gateway répond : `curl http://localhost:8222/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{}'` doit renvoyer une erreur de validation JSON (400), pas une absence de réponse.

**503 juste après un démarrage**
→ Normal les premières secondes : un service qui vient de démarrer met quelques secondes à s'enregistrer auprès d'Eureka, et la gateway met à jour son cache de routes périodiquement. Réessayez après quelques secondes.

**Le jar d'un service ne peut pas être recompilé (« fichier verrouillé »)**
→ Le processus Java du service tourne encore et verrouille son `.jar`. Faites `bash stop-backend.sh` avant de recompiler manuellement avec `./mvnw clean compile`.
