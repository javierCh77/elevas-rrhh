#!/bin/bash
# Script para iniciar el stack completo de Elevas RRHH

echo "🚀 Iniciando Elevas RRHH Full Stack..."

# Verificar que existe .env
if [ ! -f .env ]; then
    echo "❌ Error: Archivo .env no encontrado"
    echo "Copia .env.example a .env y configura tus variables"
    exit 1
fi

# Construir y levantar servicios
echo "📦 Construyendo servicios..."
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo "✅ Stack iniciado correctamente"
echo ""
echo "🌐 Servicios disponibles:"
echo "   Landing:  http://localhost:3002"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo "   Nginx:    http://localhost"
echo ""
echo "📋 Ver logs: docker-compose logs -f"
echo "🛑 Detener:  docker-compose down"
