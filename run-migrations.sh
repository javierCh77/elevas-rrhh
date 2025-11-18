#!/bin/bash

#######################################################
# Script para ejecutar migraciones de TypeORM
# Ubicación: elevas-rhh/run-migrations.sh
#######################################################

set -e  # Exit on error

echo "=================================================="
echo "🔄 ELEVAS RRHH - Ejecutar Migraciones"
echo "=================================================="
echo ""

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    echo "Por favor inicia Docker Desktop y vuelve a intentar"
    exit 1
fi

# Verificar que el contenedor backend esté corriendo
if ! docker ps | grep -q elevas-backend; then
    echo "⚠️  El contenedor backend no está corriendo"
    echo "Iniciando contenedores..."
    docker-compose up -d
    echo ""
    echo "⏳ Esperando que el backend esté listo..."
    sleep 10
fi

echo "📊 Estado actual de la base de datos:"
echo "---------------------------------------------------"
docker-compose exec backend npm run migration:show
echo ""

echo "---------------------------------------------------"
echo "Opciones de migración:"
echo "---------------------------------------------------"
echo "1. Ejecutar migraciones pendientes (migration:run)"
echo "2. Generar nueva migración (migration:generate)"
echo "3. Crear migración vacía (migration:create)"
echo "4. Revertir última migración (migration:revert)"
echo "5. Mostrar migraciones (migration:show)"
echo "6. Salir"
echo ""

read -p "Selecciona una opción [1-6]: " option

case $option in
    1)
        echo ""
        echo "🚀 Ejecutando migraciones pendientes..."
        docker-compose exec backend npm run migration:run
        echo ""
        echo "✅ Migraciones ejecutadas exitosamente"
        ;;
    2)
        echo ""
        read -p "Nombre de la migración (ej: AddUserTable): " migration_name
        if [ -z "$migration_name" ]; then
            echo "❌ Error: Debes proporcionar un nombre para la migración"
            exit 1
        fi
        echo ""
        echo "📝 Generando migración: $migration_name"
        docker-compose exec backend npm run migration:generate -- src/migrations/$migration_name
        echo ""
        echo "✅ Migración generada en: backend-rrhh/src/migrations/"
        ;;
    3)
        echo ""
        read -p "Nombre de la migración (ej: AddUserTable): " migration_name
        if [ -z "$migration_name" ]; then
            echo "❌ Error: Debes proporcionar un nombre para la migración"
            exit 1
        fi
        echo ""
        echo "📄 Creando migración vacía: $migration_name"
        docker-compose exec backend npm run migration:create -- src/migrations/$migration_name
        echo ""
        echo "✅ Migración creada en: backend-rrhh/src/migrations/"
        ;;
    4)
        echo ""
        read -p "⚠️  ¿Estás seguro de revertir la última migración? (s/n): " confirm
        if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
            echo ""
            echo "⏪ Revirtiendo última migración..."
            docker-compose exec backend npm run migration:revert
            echo ""
            echo "✅ Migración revertida exitosamente"
        else
            echo "Operación cancelada"
        fi
        ;;
    5)
        echo ""
        echo "📋 Migraciones actuales:"
        docker-compose exec backend npm run migration:show
        ;;
    6)
        echo "👋 Saliendo..."
        exit 0
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "✨ Proceso completado"
echo "=================================================="
