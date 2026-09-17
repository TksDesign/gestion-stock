#!/usr/bin/env bash
set -euo pipefail

# Configuration
LOG_DIR="logs"
SERVICES=("config-server" "discovery" "auth" "customer" "notification" "order" "payment" "product" "shop" "gateway")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Démarrage du Backend Microservices ===${NC}"

# 1. Setup Environment
if [ ! -f .env ]; then
    echo -e "${YELLOW}Fichier .env introuvable. Création depuis .env.example...${NC}"
    cp .env.example .env
fi

# 2. Start Docker Infrastructure
echo -e "\n${GREEN}=== Démarrage de l'infrastructure Docker (BDDs, Kafka, etc.) ===${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
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

# Ensuite les autres services
for SERVICE in "auth" "customer" "notification" "order" "payment" "product" "shop" "gateway"; do
    start_service "$SERVICE" 5
done

echo -e "\n${GREEN}=== Tous les services sont en cours de démarrage ! ===${NC}"
echo -e "Utilisez ${YELLOW}tail -f logs/<nom_du_service>.log${NC} pour voir les logs d'un service."
echo -e "Pour tout arrêter proprement, lancez ${YELLOW}./stop-backend.sh${NC}"
