#!/bin/bash

# ==============================================
# Elevas RRHH - Docker Start Script
# ==============================================
# Este script facilita el inicio de los contenedores

set -e

echo "🚀 Iniciando Elevas RRHH con Docker..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que existe .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo ""
    echo "Por favor, crea el archivo .env desde .env.example:"
    echo "  cp .env.example .env"
    echo ""
    echo "Luego edita .env con tus valores reales"
    exit 1
fi

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    echo ""
    echo "Por favor, inicia Docker Desktop o el servicio de Docker"
    exit 1
fi

# Verificar que docker-compose está disponible
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: docker-compose no está instalado${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Construyendo imágenes Docker...${NC}"
echo "Esto puede tomar 20-30 minutos la primera vez"
echo ""

# Build de imágenes
docker-compose build

echo ""
echo -e "${YELLOW}🔄 Iniciando contenedores...${NC}"
echo ""

# Iniciar servicios
docker-compose up -d

echo ""
echo -e "${GREEN}✅ Contenedores iniciados${NC}"
echo ""

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo -e "${GREEN}🎉 ¡Deploy completado!${NC}"
echo ""
echo "Los servicios están disponibles en:"
echo "  • Backend API:        http://localhost:3000"
echo "  • Frontend Dashboard: http://localhost:3001"
echo "  • Landing Page:       http://localhost:3002"
echo "  • PostgreSQL:         localhost:3034"
echo ""
echo "Para ver logs en tiempo real:"
echo "  docker-compose logs -f"
echo ""
echo "Para detener los servicios:"
echo "  docker-compose down"
echo ""
