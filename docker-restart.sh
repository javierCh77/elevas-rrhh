#!/bin/bash

# ==============================================
# Elevas RRHH - Docker Restart Script
# ==============================================
# Este script reinicia los contenedores

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Reiniciando Elevas RRHH...${NC}"
echo ""

# Si se pasa un argumento, reiniciar solo ese servicio
if [ -n "$1" ]; then
    echo "Reiniciando servicio: $1"
    docker-compose restart "$1"
    echo ""
    echo -e "${GREEN}✅ Servicio $1 reiniciado${NC}"
else
    echo "Reiniciando todos los servicios"
    docker-compose restart
    echo ""
    echo -e "${GREEN}✅ Todos los servicios reiniciados${NC}"
fi

echo ""
echo "Estado de los servicios:"
docker-compose ps
