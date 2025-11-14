# 🐳 Despliegue con Docker - Elevas RRHH Full Stack

Guía completa para desplegar el stack completo de Elevas RRHH usando Docker y Docker Compose.

---

## 📋 Stack Completo

| Servicio | Puerto | Descripción | Build |
|----------|--------|-------------|-------|
| **Landing** | 3002 | Next.js (Sitio público) | ✅ Sí (Producción) |
| **Frontend** | 3001 | Next.js (Dashboard) | ❌ No (Dev mode) |
| **Backend** | 3000 | NestJS (API) | ❌ No (Dev mode) |
| **Database** | 3034 | PostgreSQL 15 | N/A |
| **Nginx** | 80/443 | Reverse Proxy | N/A |
| **Certbot** | - | SSL/TLS (Let's Encrypt) | N/A |

---

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Prerrequisitos

```bash
# Verificar Docker instalado
docker --version
docker-compose --version

# Si no está instalado:
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Linux: sudo apt-get install docker docker-compose
```

### 2. Configuración Inicial

```bash
# 1. Clonar/navegar al proyecto
cd C:\Users\usuario\Desktop\startUP\elevas-rhh

# 2. Copiar archivo de environment
copy .env.example .env

# 3. Editar .env con tus valores
# IMPORTANTE: Cambiar DB_PASSWORD, JWT_SECRET, OPENAI_API_KEY, MAIL_PASSWORD
notepad .env
```

### 3. Levantar el Stack

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# O en modo detached (background)
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f landing
docker-compose logs -f backend
```

### 4. Verificar Servicios

```bash
# Chequear que todos los contenedores estén corriendo
docker-compose ps

# Resultado esperado:
# elevas-database   Up      0.0.0.0:3034->5432/tcp
# elevas-backend    Up      0.0.0.0:3000->3000/tcp
# elevas-frontend   Up      0.0.0.0:3001->3001/tcp
# elevas-landing    Up      0.0.0.0:3002->3002/tcp
# elevas-nginx      Up      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 5. Acceder a los Servicios

- **Landing**: http://localhost (Nginx) o http://localhost:3002 (Directo)
- **Frontend App**: http://localhost/app o http://localhost:3001 (Directo)
- **Backend API**: http://localhost/api o http://localhost:3000 (Directo)
- **Database**: localhost:3034

---

## 🔧 Comandos Útiles

### Gestión de Contenedores

```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (CUIDADO: borra la base de datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart landing
docker-compose restart backend

# Reconstruir un servicio específico
docker-compose up -d --build landing

# Ver recursos usados
docker stats
```

### Logs y Debugging

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver últimas 100 líneas
docker-compose logs --tail=100

# Solo errores del backend
docker-compose logs backend | grep ERROR

# Entrar a un contenedor
docker exec -it elevas-backend sh
docker exec -it elevas-database psql -U postgres -d elevas_rrhh
```

### Base de Datos

```bash
# Backup de la base de datos
docker exec elevas-database pg_dump -U postgres elevas_rrhh > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i elevas-database psql -U postgres elevas_rrhh < backup_20251110.sql

# Conectar a la base de datos
docker exec -it elevas-database psql -U postgres -d elevas_rrhh
```

---

## 🌐 Despliegue en Producción

### Opción 1: Servidor VPS (DigitalOcean, AWS, etc.)

#### 1. Preparar el Servidor

```bash
# SSH al servidor
ssh root@your-server-ip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Subir el Proyecto

```bash
# Opción A: Git
git clone https://github.com/tu-usuario/elevas-rhh.git
cd elevas-rhh

# Opción B: SCP
scp -r C:\Users\usuario\Desktop\startUP\elevas-rhh root@your-server-ip:/opt/
```

#### 3. Configurar Environment

```bash
# Copiar y editar .env
cp .env.example .env
nano .env

# IMPORTANTE: Cambiar a valores de producción:
# - NODE_ENV=production
# - FRONTEND_URL=https://app.elevas.com
# - LANDING_URL=https://elevas.com
# - DB_PASSWORD con contraseña segura
# - JWT_SECRET con clave segura (openssl rand -base64 32)
```

#### 4. Configurar DNS

En tu proveedor de DNS (Cloudflare, GoDaddy, etc.):

```
Tipo    Nombre          Valor           TTL
A       @               your-server-ip  Auto
A       www             your-server-ip  Auto
A       app             your-server-ip  Auto
CNAME   api             @               Auto
```

#### 5. Obtener Certificados SSL

```bash
# Primera vez (obtener certificados)
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@elevas.com \
  --agree-tos \
  --no-eff-email \
  -d elevas.com -d www.elevas.com

docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@elevas.com \
  --agree-tos \
  --no-eff-email \
  -d app.elevas.com

# Descomentar las líneas SSL en nginx/nginx.conf
nano nginx/nginx.conf
# Descomentar líneas 56-57 y 110-111
```

#### 6. Levantar en Producción

```bash
# Construir y levantar
docker-compose up -d --build

# Verificar
docker-compose ps
docker-compose logs -f

# Verificar SSL
curl -I https://elevas.com
```

---

## 🔒 Seguridad en Producción

### 1. Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 2. Actualizar Contraseñas

```env
# .env - NUNCA usar valores por defecto
DB_PASSWORD=use_openssl_rand_base64_32_here
JWT_SECRET=another_secure_random_string_here
```

### 3. Secrets Management

```bash
# Usar Docker Secrets (recomendado)
echo "my_secret_password" | docker secret create db_password -

# Actualizar docker-compose.yml para usar secrets
```

---

## 📊 Monitoreo

### Health Checks

```bash
# Landing
curl http://localhost:3002

# Backend API
curl http://localhost:3000/api/health

# Database
docker exec elevas-database pg_isready -U postgres
```

### Logs Centralizados

```bash
# Instalar Portainer (UI para Docker)
docker volume create portainer_data
docker run -d -p 9000:9000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce

# Acceder: http://localhost:9000
```

---

## 🐛 Troubleshooting

### Problema: Landing no construye

```bash
# Ver logs detallados
docker-compose logs landing

# Reconstruir forzando sin caché
docker-compose build --no-cache landing
docker-compose up -d landing
```

### Problema: Backend no conecta a la base de datos

```bash
# Verificar que la base de datos esté corriendo
docker-compose ps database

# Ver logs de la base de datos
docker-compose logs database

# Verificar variables de entorno
docker exec elevas-backend env | grep DB
```

### Problema: Nginx retorna 502 Bad Gateway

```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Verificar logs de Nginx
docker-compose logs nginx

# Reiniciar Nginx
docker-compose restart nginx
```

### Problema: Out of Memory

```bash
# Ver uso de recursos
docker stats

# Aumentar memoria de Docker Desktop (Windows)
# Settings -> Resources -> Memory -> 4GB+

# Limpiar recursos no usados
docker system prune -a
```

---

## 📦 Backup y Restore

### Backup Completo

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"

mkdir -p $BACKUP_DIR

# Backup Database
docker exec elevas-database pg_dump -U postgres elevas_rrhh > $BACKUP_DIR/database.sql

# Backup Uploads (si existen)
docker cp elevas-backend:/app/uploads $BACKUP_DIR/uploads

# Tar everything
tar -czf backup_$DATE.tar.gz $BACKUP_DIR

echo "Backup completado: backup_$DATE.tar.gz"
```

### Restore

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

# Extract
tar -xzf $BACKUP_FILE

# Restore Database
docker exec -i elevas-database psql -U postgres elevas_rrhh < ./backups/*/database.sql

# Restore Uploads
docker cp ./backups/*/uploads elevas-backend:/app/

echo "Restore completado"
```

---

## 🔄 CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/elevas-rhh
            git pull
            docker-compose down
            docker-compose up -d --build
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los servicios estén corriendo: `docker-compose ps`
3. Revisa la configuración de .env
4. Consulta este documento
5. Contacta al equipo de desarrollo

---

**Última actualización**: 10 de Noviembre de 2025
