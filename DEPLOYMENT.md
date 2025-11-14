# Guía de Deployment - Elevas RRHH Full Stack

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04+ o similar
- Docker y Docker Compose instalados
- Dominios configurados apuntando al servidor:
  - `elevasconsultin.com` → Landing page
  - `elevas-app.com` → Frontend RRHH Dashboard
  - `api.elevas-app.com` → Backend API
- Puertos abiertos: 80, 443, 3034 (PostgreSQL - opcional)

## 🚀 Pasos de Deployment

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### 2. Clonar el Proyecto

```bash
# Clonar repositorio
git clone <your-repo-url> elevas-rhh
cd elevas-rhh

# Dar permisos de ejecución a scripts
chmod +x scripts/*.sh
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar archivo .env con tus valores
nano .env
```

**Variables críticas a configurar:**

```env
# Database
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_refresh_token_secret

# OpenAI
OPENAI_API_KEY=sk-proj-your_openai_api_key

# Email (Gmail)
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your_app_specific_password

# Dominios
DOMAIN_LANDING=elevasconsultin.com
DOMAIN_APP=elevas-app.com
DOMAIN_API=api.elevas-app.com
SSL_EMAIL=admin@elevasconsultin.com

# CORS
CORS_ORIGIN=https://elevas-app.com,https://elevasconsultin.com
```

### 4. Construir e Iniciar Servicios

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
./scripts/deploy.sh start

# Verificar estado
./scripts/deploy.sh status
```

### 5. Configurar SSL Certificates (Let's Encrypt)

```bash
# Inicializar certificados SSL
./scripts/deploy.sh ssl-init

# Los certificados se renovarán automáticamente cada 12 horas
```

### 6. Verificar Deployment

Acceder a los siguientes URLs:

- Landing: https://elevasconsultin.com
- App Dashboard: https://elevas-app.com
- API Health: https://api.elevas-app.com/api/health

## 🛠️ Comandos de Gestión

```bash
# Ver logs
./scripts/deploy.sh logs              # Todos los servicios
./scripts/deploy.sh logs-api          # Solo backend
./scripts/deploy.sh logs-app          # Solo frontend
./scripts/deploy.sh logs-landing      # Solo landing
./scripts/deploy.sh logs-db           # Solo database

# Reiniciar servicios
./scripts/deploy.sh restart

# Reconstruir servicios
./scripts/deploy.sh rebuild

# Detener servicios
./scripts/deploy.sh stop

# Ver estado
./scripts/deploy.sh status
```

## 💾 Backup y Restore

### Backup de Base de Datos

```bash
# Crear backup
./scripts/deploy.sh backup-db

# Los backups se guardan en: backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Restaurar Base de Datos

```bash
# Restaurar desde backup
./scripts/deploy.sh restore-db
```

## 🔒 Renovación de Certificados SSL

Los certificados se renuevan automáticamente. Para forzar renovación:

```bash
./scripts/deploy.sh ssl-renew
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│              Internet (80/443)               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Nginx Proxy   │
         │  + SSL/TLS     │
         └────────┬───────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌──────────────┐    ┌──────────────┐
│   Landing    │    │   Frontend   │
│  (Next.js)   │    │   (Next.js)  │
│    :3002     │    │     :3001    │
└──────────────┘    └──────┬───────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Backend    │
                    │   (NestJS)   │
                    │     :3000    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │     :5432    │
                    └──────────────┘
```

## 📦 Puertos Expuestos

| Servicio    | Puerto Interno | Puerto Externo | Descripción              |
|-------------|----------------|----------------|--------------------------|
| Nginx       | 80, 443        | 80, 443        | Reverse Proxy + SSL      |
| Backend     | 3000           | -              | API (via nginx)          |
| Frontend    | 3001           | -              | Dashboard (via nginx)    |
| Landing     | 3002           | -              | Website (via nginx)      |
| PostgreSQL  | 5432           | 3034           | Database (opcional)      |

## 🔐 Seguridad

### Headers de Seguridad (Nginx)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Backend
- Helmet.js con CSP
- Rate Limiting
- CORS configurado
- JWT con refresh tokens
- Bcrypt para passwords (12 rounds)

### Base de Datos
- Usuario no-root
- Contraseña segura requerida
- Network isolated

## 🐛 Troubleshooting

### Ver logs de un servicio específico

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f landing
docker-compose logs -f database
docker-compose logs -f nginx
```

### Reiniciar un servicio específico

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart landing
```

### Limpiar y reconstruir

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Verificar conectividad de base de datos

```bash
docker-compose exec backend npm run typeorm -- migration:show
```

### Acceder a la base de datos

```bash
docker-compose exec database psql -U <DB_USERNAME> -d <DB_DATABASE>
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver espacio en disco

```bash
df -h
docker system df
```

### Limpiar imágenes no utilizadas

```bash
docker system prune -a
```

## 🔄 Actualización del Proyecto

```bash
# Detener servicios
./scripts/deploy.sh stop

# Hacer backup de base de datos
./scripts/deploy.sh backup-db

# Actualizar código
git pull origin main

# Reconstruir e iniciar
./scripts/deploy.sh rebuild

# Verificar estado
./scripts/deploy.sh status
```

## 📞 Soporte

Para problemas o preguntas sobre el deployment, contactar al equipo de desarrollo.

## 📝 Notas Importantes

1. **Backup Regular**: Configurar cron job para backups automáticos
2. **Monitoreo**: Considerar implementar soluciones de monitoreo (Prometheus, Grafana)
3. **Logs**: Configurar rotación de logs para evitar llenado de disco
4. **Seguridad**: Mantener Docker y dependencias actualizadas
5. **Firewall**: Configurar firewall para permitir solo puertos necesarios

## 🔧 Configuración Avanzada

### Configurar Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * cd /path/to/elevas-rhh && ./scripts/deploy.sh backup-db

# Limpiar backups antiguos (más de 30 días)
0 3 * * * find /path/to/elevas-rhh/backups -name "*.gz" -mtime +30 -delete
```

### Configurar Firewall (UFW)

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

## 🎯 Checklist Post-Deployment

- [ ] Servicios corriendo correctamente
- [ ] SSL certificates activos
- [ ] Base de datos accesible
- [ ] Logs sin errores críticos
- [ ] Backup automático configurado
- [ ] Firewall configurado
- [ ] Dominios resolviendo correctamente
- [ ] Email (SMTP) funcionando
- [ ] OpenAI API conectada
- [ ] Autenticación JWT funcionando
