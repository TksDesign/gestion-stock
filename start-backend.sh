#!/usr/bin/env bash
set -euo pipefail

if [ -z "${JAVA_HOME:-}" ]; then
    for candidate in /mnt/c/Users/*/java/jdk-17 /c/Users/*/java/jdk-17; do
        if [ -x "$candidate/bin/java" ]; then
            export JAVA_HOME="$candidate"
            break
        fi
    done
fi

if [[ "${JAVA_HOME:-}" =~ ^([A-Za-z]):[\\/](.*)$ ]]; then
    JAVA_DRIVE="${BASH_REMATCH[1],,}"
    JAVA_PATH="${BASH_REMATCH[2]//\\//}"
    export JAVA_HOME="/$JAVA_DRIVE/$JAVA_PATH"
elif command -v cygpath >/dev/null 2>&1 && [[ "${JAVA_HOME:-}" =~ ^[A-Za-z]:[\\/].* ]]; then
    export JAVA_HOME="$(cygpath -u "$JAVA_HOME")"
fi

if [ -n "${JAVA_HOME:-}" ]; then
    export PATH="$JAVA_HOME/bin:$PATH"
fi

# Configuration
LOG_DIR="logs"
SERVICES=("config-server" "discovery" "auth" "customer" "notification" "order" "payment" "product" "shop" "gateway")

# Port de chaque service : sert à détecter/tuer une instance déjà en cours avant de
# recompiler (le jar est verrouillé par le process Java tant qu'il tourne sur Windows,
# ce qui fait échouer "mvnw clean" avec une erreur de suppression de fichier).
declare -A SERVICE_PORTS=(
    [config-server]=8888
    [discovery]=8761
    [auth]=8095
    [customer]=8090
    [notification]=8040
    [order]=8070
    [payment]=8060
    [product]=8050
    [shop]=8100
    [gateway]=8222
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Démarrage du Backend Microservices ===${NC}"

# 0. Stop any already-running instance of these services (rend le script idempotent :
#    relancer alors que le backend tourne déjà ne doit pas planter à la compilation).
echo -e "\n${GREEN}=== Vérification des instances déjà en cours ===${NC}"
stop_if_running() {
    local SERVICE=$1
    local PORT=${SERVICE_PORTS[$SERVICE]}
    local PID
    PID=$(netstat -ano 2>/dev/null | grep ":$PORT " | grep LISTENING | awk '{print $NF}' | head -n 1 || true)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}$SERVICE${NC} déjà en cours sur le port $PORT (PID $PID) — arrêt..."
        taskkill //F //PID "$PID" >/dev/null 2>&1 || kill -9 "$PID" 2>/dev/null || true
    fi
}
for SERVICE in "${SERVICES[@]}"; do
    stop_if_running "$SERVICE"
done
rm -f "$LOG_DIR"/*.pid 2>/dev/null || true

# 1. Setup Environment
if [ ! -f .env ]; then
    echo -e "${YELLOW}Fichier .env introuvable. Création depuis .env.example...${NC}"
    cp .env.example .env
fi

# 2. Start Docker Infrastructure
echo -e "\n${GREEN}=== Démarrage de l'infrastructure Docker (BDDs, Kafka, etc.) ===${NC}"
if ! docker compose up -d; then
    echo -e "${RED}Échec du démarrage des conteneurs Docker. Assurez-vous que Docker est lancé.${NC}"
    exit 1
fi

echo -e "${YELLOW}Attente de l'initialisation des bases de données... (15s)${NC}"
sleep 15

# 3. Prepare Log Directory
mkdir -p "$LOG_DIR"
echo -e "Les logs seront écrits dans le dossier ${YELLOW}./$LOG_DIR${NC}"

# 4. Compile all services
echo -e "\n${GREEN}=== Compilation des services Java (sans les tests) ===${NC}"
for SERVICE in "${SERVICES[@]}"; do
    echo -n "Compilation de $SERVICE... "
    cd "services/$SERVICE"
    ./mvnw clean package -DskipTests -q
    cd ../..
    echo -e "${GREEN}Terminé${NC}"
done

# 5. Start Java Services
echo -e "\n${GREEN}=== Démarrage des microservices ===${NC}"

start_service() {
    local SERVICE=$1
    local WAIT_TIME=$2
    echo -e "Démarrage de ${YELLOW}$SERVICE${NC}..."

    cd "services/$SERVICE"
    JAR_FILE=$(ls target/*.jar | grep -v plain | head -n 1)

    nohup java -jar "$JAR_FILE" > "../../$LOG_DIR/${SERVICE}.log" 2>&1 &
    local PID=$!
    echo "$PID" > "../../$LOG_DIR/${SERVICE}.pid"
    cd ../..

    echo -e "Service ${YELLOW}$SERVICE${NC} démarré (PID $PID). Attente de ${WAIT_TIME}s..."
    sleep "$WAIT_TIME"
}

# L'ordre est important : config-server en premier
start_service "config-server" 25

# Ensuite le discovery (Eureka)
start_service "discovery" 20

# Ensuite les autres services (product avant shop : shop migre les anciens produits
# au démarrage via un appel direct à product-service, voir LegacyProductMigrationRunner)
for SERVICE in "auth" "customer" "notification" "order" "payment" "product" "shop" "gateway"; do
    start_service "$SERVICE" 5
done

echo -e "\n${GREEN}=== Tous les services sont en cours de démarrage ! ===${NC}"
echo -e "Utilisez ${YELLOW}tail -f logs/<nom_du_service>.log${NC} pour voir les logs d'un service."
echo -e "Pour tout arrêter proprement, lancez ${YELLOW}./stop-backend.sh${NC}"
