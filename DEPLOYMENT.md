# Guía de Deployment Manual - Elevas RRHH

## Arquitectura de Deployment

El proyecto se despliega en **3 contenedores independientes** que se comunican entre sí:

1. **Backend** (NestJS) - Puerto 3000
2. **Frontend** (Next.js) - Puerto 3001
3. **Landing** (Next.js) - Puerto 3002

## Dominios Configurados

- **Landing**: elevasconsultin.com → Puerto 3002
- **Frontend/App**: elevas-app.com → Puerto 3001
- **Backend/API**: api.elevas-app.com → Puerto 3000

## Requisitos Previos

- Docker instalado en el VPS
- Acceso SSH al VPS
- Puertos 3000, 3001, 3002 disponibles
- Configurar DNS para apuntar los dominios al VPS

## Archivos de Configuración

Cada proyecto tiene su propio archivo `.env.production`:

```
backend-rrhh/.env.production   # Configuración del backend
frontend-rrhh/.env.production  # Configuración del frontend
elevas-landing/.env.production # Configuración del landing
```

## Scripts de Deployment

### Opción 1: Deployment Completo (Todos los contenedores)

```bash
# Dar permisos de ejecución
chmod +x deploy-*.sh

# Desplegar todo
./deploy-all.sh
```

### Opción 2: Deployment Individual

#### Backend
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

#### Frontend
```bash
chmod +x deploy-frontend.sh
export OPENAI_API_KEY="tu-api-key-aqui"
./deploy-frontend.sh
```

#### Landing
```bash
chmod +x deploy-landing.sh
export OPENAI_API_KEY="tu-api-key-aqui"
./deploy-landing.sh
```

## Pasos para Deployment en VPS

### 1. Subir el código al VPS

```bash
# Desde tu máquina local
scp -r elevas-rhh/ usuario@tu-vps-ip:/home/usuario/
```

O usando Git:

```bash
# En el VPS
git clone https://github.com/tu-usuario/elevas-rhh.git
cd elevas-rhh
```

### 2. Crear la red de Docker

```bash
docker network create elevas-network
```

### 3. Desplegar los contenedores

```bash
# Opción A: Todos a la vez
./deploy-all.sh

# Opción B: Uno por uno (recomendado)
./deploy-backend.sh
# Esperar que termine, luego:
./deploy-frontend.sh
# Esperar que termine, luego:
./deploy-landing.sh
```

### 4. Verificar que los contenedores están corriendo

```bash
docker ps | grep elevas
```

Deberías ver 3 contenedores:
- elevas-backend
- elevas-frontend
- elevas-landing

### 5. Ver logs

```bash
# Backend
docker logs -f elevas-backend

# Frontend
docker logs -f elevas-frontend

# Landing
docker logs -f elevas-landing
```

## Configuración de Nginx/Reverse Proxy

Necesitarás configurar Nginx o un reverse proxy para mapear los dominios a los puertos:

```nginx
# api.elevas-app.com → localhost:3000
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

# elevas-app.com → localhost:3001
server {
    listen 80;
    server_name elevas-app.com www.elevas-app.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# elevasconsultin.com → localhost:3002
server {
    listen 80;
    server_name elevasconsultin.com www.elevasconsultin.com;

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

## Configurar SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d api.elevas-app.com
sudo certbot --nginx -d elevas-app.com -d www.elevas-app.com
sudo certbot --nginx -d elevasconsultin.com -d www.elevasconsultin.com

# Renovación automática (se configura automáticamente)
sudo certbot renew --dry-run
```

## Base de Datos

El backend espera conectarse a PostgreSQL en `database:5432`. Tienes dos opciones:

### Opción 1: Contenedor de PostgreSQL (Recomendado)

```bash
docker run -d \
  --name elevas-database \
  --network elevas-network \
  --restart unless-stopped \
  -e POSTGRES_DB=elevas_hr \
  -e POSTGRES_USER=elevas_user \
  -e POSTGRES_PASSWORD=elevas_pass123 \
  -p 3034:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Opción 2: PostgreSQL instalado en el VPS

Modifica `backend-rrhh/.env.production` y cambia `DB_HOST=database` por `DB_HOST=localhost`

## Comandos Útiles

### Ver estado de contenedores
```bash
docker ps | grep elevas
```

### Detener contenedores
```bash
docker stop elevas-backend elevas-frontend elevas-landing
```

### Eliminar contenedores
```bash
docker rm elevas-backend elevas-frontend elevas-landing
```

### Ver logs en tiempo real
```bash
docker logs -f elevas-backend
```

### Reiniciar un contenedor
```bash
docker restart elevas-backend
```

### Entrar a un contenedor
```bash
docker exec -it elevas-backend sh
```

### Ver uso de recursos
```bash
docker stats
```

## Troubleshooting

### Error: Cannot connect to backend
- Verifica que los 3 contenedores estén en la misma red: `elevas-network`
- Verifica las variables de entorno en los archivos `.env.production`

### Error: Port already in use
- Detén el proceso que está usando el puerto
- O cambia el puerto en el archivo `.env.production` correspondiente

### Error: Database connection failed
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend-rrhh/.env.production`

### Frontend/Landing no puede conectarse al backend
- Verifica que `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_BACKEND_URL` apunten a `https://api.elevas-app.com`
- Verifica que el reverse proxy esté configurado correctamente

## Actualizaciones

Para actualizar el código:

```bash
# Detener contenedor
docker stop elevas-backend

# Pull nuevo código
git pull

# Re-build y desplegar
./deploy-backend.sh
```

## Monitoreo

Considera instalar herramientas de monitoreo:

- **Portainer**: Para gestión visual de Docker
- **Netdata**: Para monitoreo de recursos
- **PM2**: Para gestión de procesos (alternativa)

## Seguridad

⚠️ **IMPORTANTE**: Antes de ir a producción:

1. Cambia las claves en los archivos `.env.production`:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `DB_PASSWORD`

2. Nunca hagas commit de archivos `.env.production` al repositorio

3. Usa variables de entorno del sistema o herramientas como Docker Secrets

4. Configura firewall para solo permitir puertos 80, 443 y SSH

## Backup

### Backup de Base de Datos
```bash
docker exec elevas-database pg_dump -U elevas_user elevas_hr > backup.sql
```

### Restaurar Base de Datos
```bash
docker exec -i elevas-database psql -U elevas_user elevas_hr < backup.sql
```
