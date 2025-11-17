#!/bin/bash

# ==============================================
# Script de Deployment - Backend
# ==============================================

echo "======================================"
echo "ELEVAS - Deployment Backend"
echo "======================================"

# Variables
IMAGE_NAME="elevas-backend"
CONTAINER_NAME="elevas-backend"
PORT=3000

# Detener y eliminar contenedor anterior si existe
echo "🛑 Deteniendo contenedor anterior..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Eliminar imagen anterior
echo "🗑️  Eliminando imagen anterior..."
docker rmi $IMAGE_NAME 2>/dev/null || true

# Construir nueva imagen
echo "🔨 Construyendo imagen..."
cd backend-rrhh
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen"
    exit 1
fi

# Ejecutar contenedor
echo "🚀 Iniciando contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:$PORT \
  --network elevas-network \
  -v $(pwd)/uploads:/app/uploads \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ Backend desplegado exitosamente"
    echo "📍 URL: http://localhost:$PORT"
    echo "🔍 Logs: docker logs -f $CONTAINER_NAME"
else
    echo "❌ Error al iniciar el contenedor"
    exit 1
fi

# Mostrar logs
echo ""
echo "📋 Mostrando logs..."
docker logs -f $CONTAINER_NAME
