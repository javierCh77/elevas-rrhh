#!/bin/bash

# ==============================================
# Elevas RRHH - Docker Stop Script
# ==============================================
# Este script detiene los contenedores

set -e

echo "🛑 Deteniendo Elevas RRHH..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detener contenedores
docker-compose down

echo ""
echo -e "${GREEN}✅ Contenedores detenidos${NC}"
echo ""
echo "Los datos persisten en los volúmenes Docker"
echo ""
echo "Para eliminar también los datos (⚠️ PELIGROSO):"
echo "  docker-compose down -v"
echo ""
