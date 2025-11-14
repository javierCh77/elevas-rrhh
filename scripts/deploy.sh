#!/bin/bash

# Script de Deployment para Elevas RRHH Full Stack
# Ejecutar en el servidor VPS

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Elevas RRHH - Deployment Script${NC}"
echo -e "${BLUE}=====================================${NC}"

# Verificar que existe .env
if [ ! -f .env ]; then
    echo -e "${RED}Error: Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Copia .env.example a .env y configura las variables${NC}"
    exit 1
fi

# Función para mostrar uso
show_usage() {
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start       - Iniciar todos los servicios"
    echo "  stop        - Detener todos los servicios"
    echo "  restart     - Reiniciar todos los servicios"
    echo "  rebuild     - Reconstruir y reiniciar servicios"
    echo "  logs        - Ver logs de todos los servicios"
    echo "  logs-api    - Ver logs del backend"
    echo "  logs-app    - Ver logs del frontend"
    echo "  logs-landing - Ver logs del landing"
    echo "  logs-db     - Ver logs de la base de datos"
    echo "  status      - Ver estado de los servicios"
    echo "  clean       - Limpiar contenedores y volúmenes"
    echo "  backup-db   - Backup de la base de datos"
    echo "  restore-db  - Restaurar base de datos"
    echo "  ssl-init    - Inicializar certificados SSL"
    echo "  ssl-renew   - Renovar certificados SSL"
}

# Función para iniciar servicios
start_services() {
    echo -e "${GREEN}Iniciando servicios...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Servicios iniciados correctamente${NC}"
    docker-compose ps
}

# Función para detener servicios
stop_services() {
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    docker-compose down
    echo -e "${GREEN}Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${YELLOW}Reiniciando servicios...${NC}"
    docker-compose restart
    echo -e "${GREEN}Servicios reiniciados${NC}"
}

# Función para rebuild
rebuild_services() {
    echo -e "${YELLOW}Reconstruyendo servicios...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "${GREEN}Servicios reconstruidos e iniciados${NC}"
}

# Función para ver logs
view_logs() {
    service=$1
    if [ -z "$service" ]; then
        docker-compose logs -f --tail=100
    else
        docker-compose logs -f --tail=100 $service
    fi
}

# Función para ver estado
check_status() {
    echo -e "${BLUE}Estado de los servicios:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}Uso de recursos:${NC}"
    docker stats --no-stream
}

# Función para limpiar
clean_services() {
    echo -e "${RED}¿Estás seguro de eliminar todos los contenedores y volúmenes? (y/N)${NC}"
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo -e "${YELLOW}Limpiando servicios...${NC}"
        docker-compose down -v
        docker system prune -f
        echo -e "${GREEN}Limpieza completada${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Función para backup de BD
backup_database() {
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backups/db_backup_${timestamp}.sql"

    echo -e "${YELLOW}Creando backup de base de datos...${NC}"
    mkdir -p backups

    docker-compose exec -T database pg_dump -U $DB_USERNAME $DB_DATABASE > $backup_file

    echo -e "${GREEN}Backup creado: $backup_file${NC}"

    # Comprimir backup
    gzip $backup_file
    echo -e "${GREEN}Backup comprimido: ${backup_file}.gz${NC}"
}

# Función para restaurar BD
restore_database() {
    echo -e "${YELLOW}Archivos de backup disponibles:${NC}"
    ls -lh backups/
    echo ""
    echo -e "${YELLOW}Ingresa el nombre del archivo a restaurar:${NC}"
    read backup_file

    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}Error: Archivo no encontrado${NC}"
        exit 1
    fi

    echo -e "${RED}¿Estás seguro de restaurar la base de datos? Esto eliminará los datos actuales. (y/N)${NC}"
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        # Descomprimir si es necesario
        if [[ $backup_file == *.gz ]]; then
            gunzip -c $backup_file | docker-compose exec -T database psql -U $DB_USERNAME $DB_DATABASE
        else
            cat $backup_file | docker-compose exec -T database psql -U $DB_USERNAME $DB_DATABASE
        fi
        echo -e "${GREEN}Base de datos restaurada${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Función para inicializar SSL
init_ssl() {
    echo -e "${YELLOW}Inicializando certificados SSL...${NC}"
    bash scripts/init-letsencrypt.sh
}

# Función para renovar SSL
renew_ssl() {
    echo -e "${YELLOW}Renovando certificados SSL...${NC}"
    docker-compose run --rm certbot renew
    docker-compose exec nginx nginx -s reload
    echo -e "${GREEN}Certificados renovados${NC}"
}

# Procesar comando
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    rebuild)
        rebuild_services
        ;;
    logs)
        view_logs
        ;;
    logs-api)
        view_logs backend
        ;;
    logs-app)
        view_logs frontend
        ;;
    logs-landing)
        view_logs landing
        ;;
    logs-db)
        view_logs database
        ;;
    status)
        check_status
        ;;
    clean)
        clean_services
        ;;
    backup-db)
        backup_database
        ;;
    restore-db)
        restore_database
        ;;
    ssl-init)
        init_ssl
        ;;
    ssl-renew)
        renew_ssl
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

exit 0
