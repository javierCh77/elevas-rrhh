# 🔌 Configuración de Puertos - Elevas RRHH

## Puertos Asignados

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Backend** (NestJS) | `3000` | http://localhost:3000 |
| **Frontend** (Dashboard) | `3001` | http://localhost:3001 |
| **Landing** (Web Pública) | `3002` | http://localhost:3002 |
| **Base de Datos** (PostgreSQL) | `3034` | localhost:3034 |

---

## 📋 Instrucciones de Inicio

### 1️⃣ Iniciar Base de Datos

```bash
cd backend-rrhh
npm run db:start
```

**Salida esperada:**
```
✅ PostgreSQL database is ready!
📊 Database: elevas_hr
👤 User: elevas_user
🔌 Port: 3034
```

**Connection String:**
```
postgresql://elevas_user:elevas_pass123@localhost:3034/elevas_hr
```

---

### 2️⃣ Iniciar Backend

```bash
cd backend-rrhh
npm run start:dev
```

**Salida esperada:**
```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Running on: http://localhost:3000
```

**Endpoints importantes:**
- API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/eva/health
- Connection Status: http://localhost:3000/api/eva/connection-status

---

### 3️⃣ Iniciar Frontend (Dashboard)

```bash
cd frontend-rrhh
npm run dev
```

**Salida esperada:**
```
▲ Next.js 15.5.3
- Local:        http://localhost:3001
- ready started server on 0.0.0.0:3001
```

**Acceso:**
- Dashboard: http://localhost:3001/dashboard
- Login: http://localhost:3001/login

---

### 4️⃣ Iniciar Landing (Web Pública)

```bash
cd elevas-landing
npm run dev
```

**Salida esperada:**
```
▲ Next.js 15.5.3
- Local:        http://localhost:3002
- ready started server on 0.0.0.0:3002
```

**Acceso:**
- Home: http://localhost:3002
- Empleos: http://localhost:3002/empleos
- Contacto: http://localhost:3002/contacto

---

## 🔄 Orden de Inicio Recomendado

1. **Base de Datos** (puerto 3034) - Debe estar corriendo primero
2. **Backend** (puerto 3000) - Depende de la base de datos
3. **Frontend** (puerto 3001) - Depende del backend
4. **Landing** (puerto 3002) - Depende del backend

---

## ⚙️ Archivos de Configuración

### Backend (.env)
```env
PORT=3000
DB_PORT=3034
LANDING_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Landing (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

---

## 🛑 Detener Servicios

### Detener Backend y Frontends
- **Ctrl + C** en cada terminal

### Detener Base de Datos
```bash
cd backend-rrhh
npm run db:stop
```

---

## 🔍 Verificación de Puertos

### Windows
```powershell
# Ver qué está corriendo en cada puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3034
```

### Linux/Mac
```bash
# Ver qué está corriendo en cada puerto
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3034
```

---

## 🐛 Troubleshooting

### Error: "Puerto ya en uso"

**Problema:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solución Windows:**
```powershell
# Encontrar el proceso
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número encontrado)
taskkill /PID <PID> /F
```

**Solución Linux/Mac:**
```bash
# Encontrar y matar el proceso
kill -9 $(lsof -ti:3000)
```

### Backend no conecta con la base de datos

1. Verificar que el contenedor de Docker esté corriendo:
```bash
docker ps | grep elevas-backend-postgres
```

2. Si no está corriendo, iniciar la base de datos:
```bash
cd backend-rrhh
npm run db:start
```

3. Verificar logs del contenedor:
```bash
npm run db:logs
```

### Frontend no conecta con Backend

1. Verificar que el backend esté corriendo en puerto 3000
2. Revisar el archivo `.env.local` del frontend
3. Verificar en el navegador: http://localhost:3000/api/eva/health

---

## 📝 Notas Importantes

- **CORS:** El backend permite conexiones desde `localhost:3001` y `localhost:3002`
- **OpenAI:** Configurar `OPENAI_API_KEY` en `backend-rrhh/.env` para habilitar EVA
- **Uploads:** Los archivos subidos se guardan en `backend-rrhh/uploads/`
- **Database:** Los datos persisten en un volumen Docker llamado `elevas_backend_postgres_data`

---

## 🚀 Producción

En producción, actualizar las variables de entorno:

```env
# Backend
PORT=3000
FRONTEND_URL=https://dashboard.elevasconsulting.com
LANDING_URL=https://elevasconsulting.com
DB_PORT=5432

# Frontend
NEXT_PUBLIC_API_URL=https://api.elevasconsulting.com/api

# Landing
NEXT_PUBLIC_BACKEND_URL=https://api.elevasconsulting.com
```
