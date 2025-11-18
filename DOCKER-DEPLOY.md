# 🐳 Guía de Deploy con Docker - Elevas RRHH

Esta guía explica cómo desplegar el proyecto completo usando Docker y Docker Compose.

## 📋 Prerequisitos

- Docker Engine 24.0 o superior
- Docker Compose 2.20 o superior
- Al menos 4GB de RAM disponible
- 10GB de espacio en disco

## 🏗️ Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────┐
│              elevas-network (bridge)            │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │  database    │◄───│   backend    │          │
│  │ PostgreSQL   │    │   NestJS     │          │
│  │  Port: 3034  │    │  Port: 3000  │          │
│  └──────────────┘    └──────────────┘          │
│                             ▲                   │
│                             │                   │
│                    ┌────────┴────────┐          │
│                    │                 │          │
│              ┌─────┴──────┐   ┌─────┴──────┐   │
│              │  frontend  │   │  landing   │   │
│              │  Next.js   │   │  Next.js   │   │
│              │ Port: 3001 │   │ Port: 3002 │   │
│              └────────────┘   └────────────┘   │
└─────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
elevas-rhh/
├── .env                          # ← Variables de entorno centralizadas
├── .env.example                  # ← Template de variables
├── docker-compose.yml            # ← Orquestación de contenedores
├── .dockerignore                 # ← Archivos ignorados en build
│
├── backend-rrhh/
│   ├── Dockerfile                # ← Build multi-stage para backend
│   ├── .dockerignore
│   └── src/
│       └── app.module.ts         # ← Apunta a ../.env
│
├── frontend-rrhh/
│   ├── Dockerfile                # ← Build multi-stage para frontend
│   ├── .dockerignore
│   └── next.config.ts            # ← output: 'standalone'
│
└── elevas-landing/
    ├── Dockerfile                # ← Build multi-stage para landing
    ├── .dockerignore
    └── next.config.ts            # ← output: 'standalone'
```

## 🚀 Pasos para Deploy

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores reales
nano .env  # o vim, code, etc.
```

**Variables CRÍTICAS que debes cambiar:**

```bash
# Seguridad
JWT_SECRET=                    # Genera con: openssl rand -base64 32
JWT_REFRESH_SECRET=            # Genera con: openssl rand -base64 32
DB_PASSWORD=                   # Contraseña segura para PostgreSQL

# APIs Externas
OPENAI_API_KEY=               # Desde https://platform.openai.com/api-keys
MAIL_PASSWORD=                # App password de Gmail

# Dominios (para producción)
LANDING_URL=                  # https://elevasconsultin.com
FRONTEND_URL=                 # https://elevas-app.com
NEXT_PUBLIC_API_URL=          # https://api.elevas-app.com
```

### 2. Build de las Imágenes

```bash
# Construir todas las imágenes
docker-compose build

# O construir con caché limpio (recomendado primera vez)
docker-compose build --no-cache
```

**Tiempos estimados de build:**
- Backend: ~5-7 minutos
- Frontend: ~8-10 minutos
- Landing: ~8-10 minutos
- **Total: ~20-30 minutos** (primera vez)

### 3. Iniciar los Servicios

```bash
# Iniciar todos los servicios en background
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f landing
docker-compose logs -f database
```

### 4. Verificar el Estado

```bash
# Ver estado de contenedores
docker-compose ps

# Ver salud de servicios
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Verificar logs para errores
docker-compose logs --tail=50
```

**Todos los servicios deberían mostrar "healthy" después de ~1 minuto**

### 5. Acceder a los Servicios

Una vez iniciados, los servicios estarán disponibles en:

- **Backend API**: http://localhost:3000
- **Frontend Dashboard**: http://localhost:3001
- **Landing Page**: http://localhost:3002
- **PostgreSQL**: localhost:3034

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver uso de recursos
docker stats
```

### Debugging

```bash
# Entrar a un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec database psql -U postgres -d elevas_rrhh

# Ver variables de entorno de un servicio
docker-compose exec backend env

# Reconstruir y reiniciar un servicio
docker-compose up -d --build backend
```

### Logs y Monitoreo

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs con timestamps
docker-compose logs -f -t

# Últimas 100 líneas
docker-compose logs --tail=100

# Logs desde hace 5 minutos
docker-compose logs --since 5m
```

### Backup de Base de Datos

```bash
# Crear backup
docker-compose exec database pg_dump -U postgres elevas_rrhh > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T database psql -U postgres elevas_rrhh < backup_20250117_153000.sql
```

## 🔒 Seguridad

### Checklist de Producción

- [ ] Cambiar TODAS las contraseñas por defecto
- [ ] Generar JWT_SECRET y JWT_REFRESH_SECRET únicos
- [ ] Usar contraseñas fuertes (>16 caracteres)
- [ ] Nunca commitear el archivo `.env` a git
- [ ] Configurar firewall en el servidor
- [ ] Usar HTTPS con certificados SSL válidos
- [ ] Restringir acceso al puerto 3034 (PostgreSQL)
- [ ] Habilitar logs de auditoría

### Variables Sensibles

**NUNCA expongas públicamente:**
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `DB_PASSWORD`
- `OPENAI_API_KEY`
- `MAIL_PASSWORD`

## 🌐 Deploy en Producción (Linux)

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### 2. Clonar y Configurar

```bash
# Clonar repositorio
git clone <tu-repo> elevas-rhh
cd elevas-rhh

# Configurar .env
cp .env.example .env
nano .env

# Establecer permisos correctos
chmod 600 .env
```

### 3. Desplegar

```bash
# Build y start
docker-compose up -d --build

# Verificar
docker-compose ps
docker-compose logs -f
```

### 4. Configurar Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/elevas

# Backend API
server {
    listen 80;
    server_name api.elevas-app.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Dashboard
server {
    listen 80;
    server_name elevas-app.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Landing Page
server {
    listen 80;
    server_name elevasconsultin.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot --nginx -d api.elevas-app.com
sudo certbot --nginx -d elevas-app.com
sudo certbot --nginx -d elevasconsultin.com

# Auto-renovación
sudo certbot renew --dry-run
```

## 📊 Monitoreo

### Health Checks

Todos los servicios incluyen health checks:

```bash
# Ver estado de salud
docker inspect --format='{{.State.Health.Status}}' elevas-backend
docker inspect --format='{{.State.Health.Status}}' elevas-frontend
docker inspect --format='{{.State.Health.Status}}' elevas-landing
docker inspect --format='{{.State.Health.Status}}' elevas-database
```

### Volúmenes Persistentes

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect elevas_postgres_data
docker volume inspect elevas_backend_uploads

# Backup de volúmenes
docker run --rm -v elevas_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## 🐛 Troubleshooting

### Backend no conecta a la base de datos

```bash
# Verificar que database esté healthy
docker-compose ps database

# Ver logs de database
docker-compose logs database

# Verificar conectividad desde backend
docker-compose exec backend ping database
```

### Frontend no puede conectar al backend

```bash
# Verificar variables NEXT_PUBLIC_API_URL
docker-compose exec frontend env | grep NEXT_PUBLIC

# Reconstruir con las variables correctas
docker-compose up -d --build frontend
```

### Errores de memoria

```bash
# Aumentar memoria en docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :3002

# Cambiar puertos en docker-compose.yml si es necesario
```

## 📝 Notas Importantes

1. **Primera ejecución**: La base de datos se inicializa automáticamente
2. **Migraciones**: NestJS ejecuta las migraciones al iniciar
3. **Hot reload**: No disponible en producción (por diseño)
4. **Logs**: Se guardan en stdout/stderr, capturados por Docker
5. **Volúmenes**: Los datos persisten entre reinicios

## 🆘 Soporte

Para problemas o preguntas:
- Revisar logs: `docker-compose logs -f`
- Verificar variables: `docker-compose config`
- Estado de servicios: `docker-compose ps`

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [NestJS Docker](https://docs.nestjs.com/recipes/docker)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
