#!/bin/bash

# ==============================================
# Script de Deployment - Landing
# ==============================================

echo "======================================"
echo "ELEVAS - Deployment Landing"
echo "======================================"

# Variables
IMAGE_NAME="elevas-landing"
CONTAINER_NAME="elevas-landing"
PORT=3002

# Detener y eliminar contenedor anterior si existe
echo "🛑 Deteniendo contenedor anterior..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Eliminar imagen anterior
echo "🗑️  Eliminando imagen anterior..."
docker rmi $IMAGE_NAME 2>/dev/null || true

# Construir nueva imagen
echo "🔨 Construyendo imagen..."
cd elevas-landing
docker build -t $IMAGE_NAME \
  --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.elevas-app.com \
  --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
  .

if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen"
    exit 1
fi

# Ejecutar contenedor
echo "🚀 Iniciando contenedor..."
cd ..
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:$PORT \
  --network elevas-network \
  -e NODE_ENV=production \
  -e PORT=$PORT \
  -e HOSTNAME="0.0.0.0" \
  -e NEXT_PUBLIC_BACKEND_URL=https://api.elevas-app.com \
  --env-file elevas-landing/.env.production \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ Landing desplegado exitosamente"
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
