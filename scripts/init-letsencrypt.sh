#!/bin/bash

# Script para inicializar certificados SSL con Let's Encrypt
# Este script debe ejecutarse UNA VEZ en el servidor de producción

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Inicializando Certificados SSL${NC}"
echo -e "${GREEN}=====================================${NC}"

# Cargar variables de entorno
if [ -f .env ]; then
    echo -e "${YELLOW}Cargando variables de entorno...${NC}"
    source .env
else
    echo -e "${RED}Error: Archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar variables requeridas
if [ -z "$DOMAIN_LANDING" ] || [ -z "$DOMAIN_APP" ] || [ -z "$DOMAIN_API" ] || [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}Error: Variables de dominio no configuradas en .env${NC}"
    echo "Requeridas: DOMAIN_LANDING, DOMAIN_APP, DOMAIN_API, SSL_EMAIL"
    exit 1
fi

domains=($DOMAIN_LANDING $DOMAIN_APP $DOMAIN_API "www.$DOMAIN_LANDING" "www.$DOMAIN_APP")
rsa_key_size=4096
data_path="./certbot"
staging=0 # Set to 1 for testing

# Verificar si ya existen certificados
if [ -d "$data_path/conf/live/$DOMAIN_LANDING" ]; then
  echo -e "${YELLOW}Certificados existentes encontrados para $DOMAIN_LANDING${NC}"
  read -p "¿Desea reemplazarlos? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

echo -e "${YELLOW}Creando directorio dummy para webroot...${NC}"
mkdir -p "$data_path/www"

echo -e "${YELLOW}Solicitando certificados para los dominios:${NC}"
for domain in "${domains[@]}"; do
  echo " - $domain"
done

# Generar dummy certificate si no existe
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo -e "${YELLOW}Descargando parámetros TLS recomendados...${NC}"
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
fi

# Crear certificados dummy para cada dominio
for domain in $DOMAIN_LANDING $DOMAIN_APP $DOMAIN_API; do
  echo -e "${YELLOW}Creando certificado dummy para $domain...${NC}"
  path="/etc/letsencrypt/live/$domain"
  mkdir -p "$data_path/conf/live/$domain"

  if [ ! -e "$data_path/conf/live/$domain/fullchain.pem" ]; then
    docker-compose run --rm --entrypoint "\
      openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
        -keyout '$path/privkey.pem' \
        -out '$path/fullchain.pem' \
        -subj '/CN=localhost'" certbot
  fi
done

echo -e "${YELLOW}Iniciando nginx con certificados dummy...${NC}"
docker-compose up --force-recreate -d nginx

# Eliminar certificados dummy
for domain in $DOMAIN_LANDING $DOMAIN_APP $DOMAIN_API; do
  echo -e "${YELLOW}Eliminando certificado dummy para $domain...${NC}"
  docker-compose run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$domain && \
    rm -Rf /etc/letsencrypt/archive/$domain && \
    rm -Rf /etc/letsencrypt/renewal/$domain.conf" certbot
done

# Solicitar certificados reales
echo -e "${GREEN}Solicitando certificados Let's Encrypt...${NC}"

# Certificado para landing
domain_args="-d $DOMAIN_LANDING -d www.$DOMAIN_LANDING"
staging_arg=""
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $domain_args \
    --email $SSL_EMAIL \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

# Certificado para app
domain_args="-d $DOMAIN_APP -d www.$DOMAIN_APP"
docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $domain_args \
    --email $SSL_EMAIL \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

# Certificado para API
domain_args="-d $DOMAIN_API"
docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $domain_args \
    --email $SSL_EMAIL \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo -e "${GREEN}Recargando nginx con certificados reales...${NC}"
docker-compose exec nginx nginx -s reload

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Certificados SSL configurados!${NC}"
echo -e "${GREEN}=====================================${NC}"
