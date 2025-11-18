#!/bin/bash

# ==============================================
# Elevas RRHH - Docker Logs Script
# ==============================================
# Este script muestra los logs de los servicios

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📋 Logs de Elevas RRHH${NC}"
echo ""

# Si se pasa un argumento, mostrar logs de ese servicio
if [ -n "$1" ]; then
    echo "Mostrando logs de: $1"
    echo ""
    docker-compose logs -f "$1"
else
    echo "Mostrando logs de todos los servicios"
    echo ""
    echo "Para ver logs de un servicio específico, usa:"
    echo "  ./docker-logs.sh backend"
    echo "  ./docker-logs.sh frontend"
    echo "  ./docker-logs.sh landing"
    echo "  ./docker-logs.sh database"
    echo ""
    docker-compose logs -f
fi
