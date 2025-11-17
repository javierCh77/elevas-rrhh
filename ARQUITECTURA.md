# Arquitectura de Deployment - Elevas RRHH

## Resumen de Dominios y Puertos

| Servicio | Dominio | Puerto | Contenedor |
|----------|---------|--------|------------|
| Backend API | api.elevas-app.com | 3000 | elevas-backend |
| Frontend App | elevas-app.com | 3001 | elevas-frontend |
| Landing Page | elevasconsultin.com | 3002 | elevas-landing |
| PostgreSQL | database | 5432 | elevas-database |

## Diagrama de Conexiones

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                     │
│                    Puerto 80/443 (SSL)                       │
└─────────────────────────────────────────────────────────────┘
            │                  │                  │
            │                  │                  │
            ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Landing   │    │  Frontend   │    │   Backend   │
    │   :3002     │    │   :3001     │    │   :3000     │
    └─────────────┘    └─────────────┘    └─────────────┘
            │                  │                  │
            │                  └──────────────────┘
            │                           │
            └───────────────────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  PostgreSQL │
                    │   :5432     │
                    └─────────────┘
```

## Flujo de Comunicación

### 1. Usuario visita Landing (elevasconsultin.com)
```
Usuario → Nginx (443) → elevas-landing (3002)
                              │
                              └─→ Backend API (3000) [Para formulario de contacto]
```

### 2. Usuario usa la App (elevas-app.com)
```
Usuario → Nginx (443) → elevas-frontend (3001)
                              │
                              └─→ Backend API (3000)
                                       │
                                       └─→ PostgreSQL (5432)
```

### 3. API Calls directos (api.elevas-app.com)
```
Cliente → Nginx (443) → elevas-backend (3000)
                              │
                              └─→ PostgreSQL (5432)
```

## Red Docker

Todos los contenedores están en la red: `elevas-network`

```
docker network: elevas-network (bridge)
├── elevas-backend
├── elevas-frontend
├── elevas-landing
└── elevas-database
```

## Variables de Entorno por Servicio

### Backend (.env.production)
- `DB_HOST=database` (nombre del contenedor PostgreSQL)
- `PORT=3000`
- `FRONTEND_URL=https://elevas-app.com`
- `LANDING_URL=https://elevasconsultin.com`
- `CORS_ORIGIN=https://elevas-app.com,https://elevasconsultin.com`
- `OPENAI_API_KEY=...`
- Credenciales de email (SMTP)

### Frontend (.env.production)
- `NEXT_PUBLIC_API_URL=https://api.elevas-app.com`
- `PORT=3001`
- `OPENAI_API_KEY=...`

### Landing (.env.production)
- `NEXT_PUBLIC_BACKEND_URL=https://api.elevas-app.com`
- `PORT=3002`
- `OPENAI_API_KEY=...`
- Credenciales de email (SMTP)

## Volúmenes Docker

```
postgres_data → /var/lib/postgresql/data (Base de datos persistente)
./backend-rrhh/uploads → /app/uploads (Archivos subidos)
```

## Comandos Rápidos

### Desplegar todo
```bash
./deploy-all.sh
```

### Ver logs de todos los servicios
```bash
docker logs -f elevas-backend &
docker logs -f elevas-frontend &
docker logs -f elevas-landing &
```

### Verificar salud de los servicios
```bash
# Backend
curl http://localhost:3000/api/health

# Frontend
curl http://localhost:3001

# Landing
curl http://localhost:3002
```

### Backup completo
```bash
# Base de datos
docker exec elevas-database pg_dump -U elevas_user elevas_hr > backup_$(date +%Y%m%d).sql

# Archivos subidos
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./backend-rrhh/uploads
```

## Orden de Inicio Recomendado

1. **PostgreSQL** (Base de datos)
   ```bash
   docker start elevas-database
   ```

2. **Backend** (API)
   ```bash
   ./deploy-backend.sh
   ```

3. **Frontend y Landing** (pueden ir en paralelo)
   ```bash
   ./deploy-frontend.sh &
   ./deploy-landing.sh &
   ```

4. **Nginx** (Reverse Proxy)
   ```bash
   sudo systemctl start nginx
   ```

## Configuración DNS Necesaria

Apuntar estos dominios a la IP de tu VPS:

```
Tipo A: api.elevas-app.com      → IP_VPS
Tipo A: elevas-app.com           → IP_VPS
Tipo A: www.elevas-app.com       → IP_VPS
Tipo A: elevasconsultin.com      → IP_VPS
Tipo A: www.elevasconsultin.com  → IP_VPS
```

## Puertos que Deben Estar Abiertos en el Firewall

```
80   → HTTP (redirige a HTTPS)
443  → HTTPS
3034 → PostgreSQL (opcional, solo si necesitas acceso externo)
22   → SSH (para administración)
```

## Healthchecks

Para monitoreo automático, puedes agregar healthchecks:

```bash
# Backend
curl https://api.elevas-app.com/api/health

# Frontend
curl https://elevas-app.com

# Landing
curl https://elevasconsultin.com
```

## Recursos Recomendados para VPS

### Mínimo
- CPU: 2 cores
- RAM: 4GB
- Disco: 20GB SSD

### Recomendado
- CPU: 4 cores
- RAM: 8GB
- Disco: 40GB SSD
