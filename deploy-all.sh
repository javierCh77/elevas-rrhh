#!/bin/bash

# ==============================================
# Script de Deployment - COMPLETO
# ==============================================

echo "======================================"
echo "ELEVAS - Deployment Completo"
echo "======================================"

# Crear red de Docker si no existe
echo "🔗 Creando red Docker..."
docker network create elevas-network 2>/dev/null || echo "✓ Red ya existe"

# Desplegar Backend
echo ""
echo "======================================"
echo "1/3 - Desplegando Backend..."
echo "======================================"
./deploy-backend.sh &
BACKEND_PID=$!

# Esperar un poco antes de desplegar frontend
sleep 10

# Desplegar Frontend
echo ""
echo "======================================"
echo "2/3 - Desplegando Frontend..."
echo "======================================"
./deploy-frontend.sh &
FRONTEND_PID=$!

# Desplegar Landing
echo ""
echo "======================================"
echo "3/3 - Desplegando Landing..."
echo "======================================"
./deploy-landing.sh &
LANDING_PID=$!

# Esperar a que todos los procesos terminen
wait $BACKEND_PID $FRONTEND_PID $LANDING_PID

echo ""
echo "======================================"
echo "✅ Deployment Completo"
echo "======================================"
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "Landing:  http://localhost:3002"
echo "======================================"
echo ""
echo "Para ver logs:"
echo "  Backend:  docker logs -f elevas-backend"
echo "  Frontend: docker logs -f elevas-frontend"
echo "  Landing:  docker logs -f elevas-landing"
echo ""
echo "Para ver estado:"
echo "  docker ps | grep elevas"
