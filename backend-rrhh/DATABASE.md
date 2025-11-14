# Elevas HR Backend - Database Setup

Este documento describe cómo configurar y manejar la base de datos PostgreSQL para el backend de Elevas HR.

## 🚀 Inicio Rápido

### Prerequisitos
- Docker Desktop instalado y ejecutándose
- Puerto 5433 disponible

### Comandos Principales

```bash
# Iniciar la base de datos
npm run db:start

# Detener la base de datos
npm run db:stop

# Resetear la base de datos (elimina todos los datos)
npm run db:reset

# Ver logs de la base de datos
npm run db:logs
```

## 📊 Configuración de la Base de Datos

- **Host:** localhost
- **Puerto:** 5433
- **Base de datos:** elevas_hr
- **Usuario:** elevas_user
- **Contraseña:** elevas_pass123

## 🔗 Cadenas de Conexión

### Para aplicaciones
```
postgresql://elevas_user:elevas_pass123@localhost:5433/elevas_hr
```

### Para psql
```bash
psql -h localhost -p 5433 -U elevas_user -d elevas_hr
```

### Para herramientas de administración
- **Host:** localhost
- **Port:** 5433
- **Database:** elevas_hr
- **Username:** elevas_user
- **Password:** elevas_pass123

## 🔧 Características

- **Extensiones habilitadas:**
  - `uuid-ossp` - Para generar UUIDs
  - `pg_trgm` - Para búsquedas de texto optimizadas

- **Persistencia:** Los datos se mantienen en un volumen Docker llamado `elevas_backend_postgres_data`

- **Health Check:** El contenedor incluye verificaciones de salud automáticas

## 🗃️ Estructura de Archivos

```
backend/
├── docker-compose.db.yml     # Configuración de Docker para PostgreSQL
├── database/
│   └── init/
│       └── 01-init.sql        # Script de inicialización
└── scripts/
    ├── db-start.sh           # Script para iniciar DB
    ├── db-stop.sh            # Script para detener DB
    └── db-reset.sh           # Script para resetear DB
```

## 🚨 Solución de Problemas

### Docker no está ejecutándose
```bash
# Error: Cannot connect to the Docker daemon
# Solución: Iniciar Docker Desktop
```

### Puerto 5433 ya está en uso
```bash
# Cambiar el puerto en docker-compose.db.yml
# De: "5433:5432"
# A:  "5434:5432"
# Y actualizar .env con DB_PORT=5434
```

### La base de datos no se conecta
```bash
# Verificar que el contenedor esté ejecutándose
docker ps

# Ver logs del contenedor
npm run db:logs

# Verificar la salud del contenedor
docker inspect elevas-backend-postgres
```

## 🔄 Desarrollo

Durante el desarrollo, TypeORM se configurará automáticamente para:
- **Sincronización automática:** Las entidades se sincronizan con la DB
- **Logging:** Las consultas SQL se muestran en la consola
- **Auto-load entities:** Las entidades se cargan automáticamente

## 🏗️ Estructura del Schema

El backend usa TypeORM para manejar las siguientes entidades:

- **Users** - Usuarios del sistema
- **Jobs** - Puestos de trabajo
- **Applications** - Aplicaciones a puestos

Todas las tablas se crean automáticamente cuando inicias el backend en modo desarrollo.