# 🚀 Guía de Deployment en VPS - Elevas RRHH

## 📋 Requisitos Previos en el VPS

### 1. Software Necesario
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Instalar Git
sudo apt install git -y

# Instalar Nginx (para reverse proxy)
sudo apt install nginx -y

# Instalar Certbot (para SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuración de DNS
Asegúrate de tener estos registros DNS configurados:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | api.elevas-app.com | IP_DEL_VPS |
| A | elevas-app.com | IP_DEL_VPS |
| A | elevasconsulting.com | IP_DEL_VPS |

---

## 🔧 Configuración del Proyecto en VPS

### 1. Clonar el Repositorio
```bash
cd /var/www
sudo git clone <TU_REPOSITORIO_GIT> elevas-rhh
cd elevas-rhh
sudo chown -R $USER:$USER .
```

### 2. Configurar Variables de Entorno

⚠️ **IMPORTANTE: Antes de subir a producción, DEBES cambiar estos valores:**

```bash
# Editar .env
nano .env
```

**Valores CRÍTICOS que debes cambiar:**

```bash
# ⚠️ CAMBIAR OBLIGATORIAMENTE (Seguridad)
JWT_SECRET=GENERA_UNA_CLAVE_SECRETA_FUERTE_AQUI
JWT_REFRESH_SECRET=GENERA_OTRA_CLAVE_SECRETA_DIFERENTE_AQUI
DB_PASSWORD=CAMBIA_ESTA_PASSWORD_POR_UNA_SEGURA

# ⚠️ CAMBIAR DB_SYNCHRONIZE A FALSE EN PRODUCCIÓN
DB_SYNCHRONIZE=false

# ✅ Estos valores ya están correctos para producción
NEXT_PUBLIC_API_URL=https://api.elevas-app.com/api
NEXT_PUBLIC_BACKEND_URL=https://api.elevas-app.com/api
CORS_ORIGIN=https://elevas-app.com,https://elevasconsulting.com,https://api.elevas-app.com
```

**Para generar claves secretas seguras:**
```bash
# Genera 2 claves diferentes para JWT_SECRET y JWT_REFRESH_SECRET
openssl rand -base64 64
openssl rand -base64 64
```

---

## 🔐 Configuración de Nginx Reverse Proxy

### 1. Backend API (api.elevas-app.com)

```bash
sudo nano /etc/nginx/sites-available/api.elevas-app.com
```

```nginx
server {
    listen 80;
    server_name api.elevas-app.com;

    # Redirección a HTTPS (se configurará después con Certbot)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout para requests largos (análisis de CVs con IA)
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # Configuración especial para archivos estáticos (CVs, uploads)
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache de archivos estáticos
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
```

### 2. Frontend Dashboard (elevas-app.com)

```bash
sudo nano /etc/nginx/sites-available/elevas-app.com
```

```nginx
server {
    listen 80;
    server_name elevas-app.com www.elevas-app.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

### 3. Landing Page (elevasconsulting.com)

```bash
sudo nano /etc/nginx/sites-available/elevasconsulting.com
```

```nginx
server {
    listen 80;
    server_name elevasconsulting.com www.elevasconsulting.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

### 4. Activar los sitios

```bash
# Crear enlaces simbólicos
sudo ln -s /etc/nginx/sites-available/api.elevas-app.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/elevas-app.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/elevasconsulting.com /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔒 Configurar SSL con Let's Encrypt

```bash
# Obtener certificados SSL para todos los dominios
sudo certbot --nginx -d api.elevas-app.com
sudo certbot --nginx -d elevas-app.com -d www.elevas-app.com
sudo certbot --nginx -d elevasconsulting.com -d www.elevasconsulting.com

# Renovación automática (ya viene configurada)
sudo certbot renew --dry-run
```

---

## 🐳 Desplegar con Docker

### 1. Construir y levantar contenedores

```bash
cd /var/www/elevas-rhh

# Construir todas las imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado de contenedores
docker-compose ps
```

### 2. Verificar que todo funcione

```bash
# Verificar backend
curl http://localhost:3000/api/eva/health

# Verificar frontend
curl http://localhost:3001

# Verificar landing
curl http://localhost:3002

# Verificar database
docker-compose exec database psql -U elevas_user -d elevas_hr -c "SELECT version();"
```

---

## 📊 Gestión de Base de Datos en Producción

### Primera vez (migración inicial)

Cuando `DB_SYNCHRONIZE=false`, necesitas ejecutar las migraciones:

```bash
# 1. Opción A: Usar migrations (RECOMENDADO)
docker-compose exec backend npm run migration:run

# 2. Opción B: Sincronización inicial (solo primera vez)
# Temporalmente cambiar DB_SYNCHRONIZE=true en .env, luego:
docker-compose restart backend
# Esperar que cree las tablas
# Volver a cambiar DB_SYNCHRONIZE=false
# Reiniciar: docker-compose restart backend
```

### Crear usuario administrador inicial

```bash
# Opción 1: Usar el endpoint de registro con Postman/curl
curl -X POST https://api.elevas-app.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elevasconsulting.com",
    "password": "TuPasswordSegura123!",
    "firstName": "Admin",
    "lastName": "Elevas",
    "role": "admin"
  }'

# Opción 2: Directamente en la base de datos
docker-compose exec database psql -U elevas_user -d elevas_hr
# Luego ejecutar los SQL commands necesarios
```

---

## 🔄 Actualizaciones Futuras

### Para actualizar la aplicación:

```bash
cd /var/www/elevas-rhh

# 1. Detener servicios
docker-compose down

# 2. Actualizar código
git pull origin main

# 3. Rebuild y restart
docker-compose build
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

---

## 📝 Backup de Base de Datos

### Crear backup

```bash
# Backup manual
docker-compose exec database pg_dump -U elevas_user elevas_hr > backup_$(date +%Y%m%d_%H%M%S).sql

# Script de backup automático (crear en /var/www/elevas-rhh/backup.sh)
#!/bin/bash
BACKUP_DIR="/var/backups/elevas-rhh"
mkdir -p $BACKUP_DIR
docker-compose exec -T database pg_dump -U elevas_user elevas_hr > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
# Mantener solo últimos 7 días
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

# Hacer ejecutable
chmod +x backup.sh

# Agregar a crontab (ejecutar diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * cd /var/www/elevas-rhh && ./backup.sh
```

### Restaurar backup

```bash
docker-compose exec -T database psql -U elevas_user elevas_hr < backup_20250118.sql
```

---

## 🔍 Monitoreo y Troubleshooting

### Ver logs de servicios

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo database
docker-compose logs -f database

# Solo frontend
docker-compose logs -f frontend
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend

# Reconstruir un servicio específico
docker-compose up -d --build backend
```

### Verificar recursos

```bash
# Ver uso de recursos
docker stats

# Ver espacio en disco
df -h

# Ver imágenes Docker
docker images

# Limpiar imágenes viejas
docker image prune -a
```

---

## 🔐 Checklist de Seguridad Pre-Producción

- [ ] Cambiar `JWT_SECRET` a un valor aleatorio y seguro
- [ ] Cambiar `JWT_REFRESH_SECRET` a un valor aleatorio y seguro
- [ ] Cambiar `DB_PASSWORD` a una contraseña fuerte
- [ ] Configurar `DB_SYNCHRONIZE=false` en producción
- [ ] Configurar SSL con Let's Encrypt
- [ ] Configurar backups automáticos de base de datos
- [ ] Configurar firewall (UFW) para permitir solo puertos 80, 443, 22
- [ ] Cambiar puerto SSH por defecto (opcional pero recomendado)
- [ ] Configurar fail2ban para protección contra brute force
- [ ] Verificar que CORS solo permite dominios específicos
- [ ] Configurar rate limiting en Nginx (opcional)

---

## 📞 URLs Finales

Después del deployment, tendrás:

- **Backend API**: https://api.elevas-app.com/api
- **Frontend Dashboard**: https://elevas-app.com
- **Landing Page**: https://elevasconsulting.com
- **Database**: Interna en Docker (puerto 3034 local, no expuesto)

---

## 🆘 Problemas Comunes

### Error: "Cannot connect to database"
```bash
# Verificar que database esté corriendo
docker-compose ps database

# Ver logs de database
docker-compose logs database

# Reiniciar database
docker-compose restart database
```

### Error: "CORS policy"
```bash
# Verificar CORS_ORIGIN en .env y docker-compose.yml
# Debe incluir: https://elevas-app.com,https://elevasconsulting.com,https://api.elevas-app.com
```

### Error: "502 Bad Gateway" en Nginx
```bash
# Verificar que los contenedores estén corriendo
docker-compose ps

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar que los puertos estén escuchando
sudo netstat -tlnp | grep -E '3000|3001|3002'
```

### Frontend no carga o muestra página en blanco
```bash
# Reconstruir frontend con las variables correctas
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

¡Listo para producción! 🚀
