#!/bin/bash

LOG_DIR="logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Arrêt du Backend Microservices ===${NC}"

# 1. Kill Java Services
echo -e "\n${GREEN}Arrêt des microservices Java...${NC}"
if [ -d "$LOG_DIR" ]; then
    for pid_file in $LOG_DIR/*.pid; do
        if [ -f "$pid_file" ]; then
            PID=$(cat "$pid_file")
            SERVICE=$(basename "$pid_file" .pid)
            if kill -0 $PID 2>/dev/null; then
                echo -e "Arrêt de ${YELLOW}$SERVICE${NC} (PID: $PID)..."
                kill $PID
            else
                echo -e "${YELLOW}$SERVICE${NC} n'est plus en cours d'exécution."
            fi
            rm "$pid_file"
        fi
    done
else
    echo "Aucun fichier PID trouvé."
fi

# 2. Stop Docker Infrastructure
echo -e "\n${GREEN}Arrêt de l'infrastructure Docker...${NC}"
docker compose stop

echo -e "\n${GREEN}=== Backend arrêté ===${NC}"
