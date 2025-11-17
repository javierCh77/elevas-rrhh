#!/bin/bash

# ==============================================
# Script de Verificación de Configuración
# ==============================================

echo "======================================"
echo "ELEVAS - Verificación de Configuración"
echo "======================================"
echo ""

ERRORS=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        return 0
    else
        echo "❌ $1 NO ENCONTRADO"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Función para verificar variable en archivo
check_env_var() {
    local file=$1
    local var=$2

    if grep -q "^$var=" "$file" 2>/dev/null; then
        local value=$(grep "^$var=" "$file" | cut -d '=' -f2-)
        if [ -n "$value" ] && [ "$value" != "CHANGE_ME" ]; then
            echo "  ✅ $var está configurado"
            return 0
        else
            echo "  ⚠️  $var está vacío o sin configurar"
            return 1
        fi
    else
        echo "  ❌ $var NO ENCONTRADO"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "1. Verificando archivos .env.production..."
echo "-------------------------------------------"
check_file "backend-rrhh/.env.production"
check_file "frontend-rrhh/.env.production"
check_file "elevas-landing/.env.production"
echo ""

echo "2. Verificando Dockerfiles..."
echo "-------------------------------------------"
check_file "backend-rrhh/Dockerfile"
check_file "frontend-rrhh/Dockerfile"
check_file "elevas-landing/Dockerfile"
echo ""

echo "3. Verificando Scripts de Deployment..."
echo "-------------------------------------------"
check_file "deploy-backend.sh"
check_file "deploy-frontend.sh"
check_file "deploy-landing.sh"
check_file "deploy-all.sh"
echo ""

echo "4. Verificando configuración Backend..."
echo "-------------------------------------------"
if [ -f "backend-rrhh/.env.production" ]; then
    check_env_var "backend-rrhh/.env.production" "DB_HOST"
    check_env_var "backend-rrhh/.env.production" "DB_PASSWORD"
    check_env_var "backend-rrhh/.env.production" "JWT_SECRET"
    check_env_var "backend-rrhh/.env.production" "OPENAI_API_KEY"
    check_env_var "backend-rrhh/.env.production" "MAIL_USER"
    check_env_var "backend-rrhh/.env.production" "MAIL_PASSWORD"
fi
echo ""

echo "5. Verificando configuración Frontend..."
echo "-------------------------------------------"
if [ -f "frontend-rrhh/.env.production" ]; then
    check_env_var "frontend-rrhh/.env.production" "NEXT_PUBLIC_API_URL"
    check_env_var "frontend-rrhh/.env.production" "OPENAI_API_KEY"
fi
echo ""

echo "6. Verificando configuración Landing..."
echo "-------------------------------------------"
if [ -f "elevas-landing/.env.production" ]; then
    check_env_var "elevas-landing/.env.production" "NEXT_PUBLIC_BACKEND_URL"
    check_env_var "elevas-landing/.env.production" "OPENAI_API_KEY"
fi
echo ""

echo "7. Verificando Docker..."
echo "-------------------------------------------"
if command -v docker &> /dev/null; then
    echo "✅ Docker instalado: $(docker --version)"

    # Verificar si Docker está corriendo
    if docker ps &> /dev/null; then
        echo "✅ Docker daemon corriendo"
    else
        echo "❌ Docker daemon NO está corriendo"
        ERRORS=$((ERRORS + 1))
    fi

    # Verificar red Docker
    if docker network ls | grep -q elevas-network; then
        echo "✅ Red elevas-network existe"
    else
        echo "⚠️  Red elevas-network NO existe (se creará automáticamente)"
    fi
else
    echo "❌ Docker NO instalado"
    ERRORS=$((ERRORS + 1))
fi
echo ""

echo "8. Verificando permisos de scripts..."
echo "-------------------------------------------"
for script in deploy-backend.sh deploy-frontend.sh deploy-landing.sh deploy-all.sh; do
    if [ -x "$script" ]; then
        echo "✅ $script es ejecutable"
    else
        echo "⚠️  $script NO es ejecutable (ejecutar: chmod +x $script)"
    fi
done
echo ""

echo "9. Verificando puertos disponibles..."
echo "-------------------------------------------"
check_port() {
    local port=$1
    local name=$2

    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            echo "⚠️  Puerto $port ($name) ya está en uso"
        else
            echo "✅ Puerto $port ($name) disponible"
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln | grep -q ":$port "; then
            echo "⚠️  Puerto $port ($name) ya está en uso"
        else
            echo "✅ Puerto $port ($name) disponible"
        fi
    else
        echo "⚠️  No se puede verificar puerto $port (netstat/ss no disponible)"
    fi
}

check_port 3000 "Backend"
check_port 3001 "Frontend"
check_port 3002 "Landing"
check_port 5432 "PostgreSQL"
echo ""

echo "======================================"
echo "RESUMEN"
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Configuración correcta - Listo para deployment"
    echo ""
    echo "Siguiente paso:"
    echo "  ./deploy-all.sh"
    exit 0
else
    echo "❌ Se encontraron $ERRORS errores"
    echo ""
    echo "Por favor corrige los errores antes de continuar"
    exit 1
fi
