#!/bin/bash

echo "==================================="
echo "Debug Frontend Container"
echo "==================================="
echo ""

# 1. Ver estado del contenedor
echo "1. Estado del contenedor frontend:"
docker ps -a | grep frontend
echo ""

# 2. Ver logs del contenedor
echo "2. Logs del contenedor (últimas 50 líneas):"
CONTAINER_ID=$(docker ps -a | grep frontend | awk '{print $1}')
if [ ! -z "$CONTAINER_ID" ]; then
  docker logs $CONTAINER_ID --tail 50
else
  echo "No se encontró el contenedor frontend"
fi
echo ""

# 3. Inspeccionar el healthcheck
echo "3. Estado del healthcheck:"
if [ ! -z "$CONTAINER_ID" ]; then
  docker inspect $CONTAINER_ID | grep -A 20 "Health"
fi
echo ""

# 4. Ver variables de entorno
echo "4. Variables de entorno del contenedor:"
if [ ! -z "$CONTAINER_ID" ]; then
  docker exec $CONTAINER_ID env | grep -E "(NODE_ENV|PORT|NEXT_PUBLIC)"
fi
echo ""

# 5. Intentar acceder al puerto internamente
echo "5. Intentando acceder a http://localhost:3001 desde dentro del contenedor:"
if [ ! -z "$CONTAINER_ID" ]; then
  docker exec $CONTAINER_ID wget --no-verbose --tries=1 --spider http://localhost:3001 2>&1
fi
echo ""

# 6. Ver procesos en el contenedor
echo "6. Procesos corriendo en el contenedor:"
if [ ! -z "$CONTAINER_ID" ]; then
  docker exec $CONTAINER_ID ps aux
fi
echo ""

# 7. Ver archivos en el contenedor
echo "7. Estructura de archivos en /app:"
if [ ! -z "$CONTAINER_ID" ]; then
  docker exec $CONTAINER_ID ls -la /app
fi
echo ""

echo "==================================="
echo "Fin del debug"
echo "==================================="
