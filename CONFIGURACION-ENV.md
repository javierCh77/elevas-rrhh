# Guía de Configuración de Variables de Entorno - Proyecto Elevas

## Arquitectura del Sistema

Tu proyecto está compuesto por **3 aplicaciones** que se comunican entre sí:

```
┌─────────────────────┐
│  elevas-landing     │ Puerto 3000 (Next.js)
│  (Página pública)   │ - Sección "Postulate"
└──────────┬──────────┘ - Chatbot EVA
           │
           │ API calls
           ↓
┌─────────────────────┐
│  backend-rrhh       │ Puerto 3010 (NestJS)
│  (API Backend)      │ - PostgreSQL (5434)
└──────────┬──────────┘ - JWT Auth
           │            - OpenAI
           │ API calls
           ↓
┌─────────────────────┐
│  frontend-rrhh      │ Puerto 3001 (Next.js)
│  (Admin Dashboard)  │ - Gestión de RRHH
└─────────────────────┘ - Panel administrativo
```

### Puertos Configurados:

| Aplicación | Puerto | Descripción |
|------------|--------|-------------|
| **backend-rrhh** | 3010 | API Backend (NestJS) |
| **elevas-landing** | 3000 | Landing pública con formulario de postulación |
| **frontend-rrhh** | 3001 | Dashboard administrativo de RRHH |
| **PostgreSQL** | 5434 | Base de datos |

---

## Archivos Creados

He generado tres archivos `.env.example`:
- [backend-rrhh/.env.example](backend-rrhh/.env.example) - Variables del backend API
- [frontend-rrhh/.env.example](frontend-rrhh/.env.example) - Variables del dashboard admin
- [elevas-landing/.env.example](elevas-landing/.env.example) - Variables de la landing pública

---

## Pasos para Configurar

### 1. Backend (backend-rrhh) - Puerto 3010

```bash
cd backend-rrhh
cp .env.example .env
```

Luego edita el archivo `.env` con tus credenciales reales:

#### Variables Críticas a Configurar:

**JWT Secrets (IMPORTANTE - Cambiar en producción):**
```bash
# Genera secrets seguros con:
openssl rand -base64 32
```
- `JWT_SECRET` - Cambia el valor por defecto
- `JWT_REFRESH_SECRET` - Cambia el valor por defecto

**Configuración de Email:**

Para **Gmail**:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicación
```

> **Nota Gmail:** Necesitas generar una "Contraseña de aplicación" en tu cuenta de Google:
> 1. Ve a https://myaccount.google.com/security
> 2. Activa verificación en 2 pasos
> 3. Genera una contraseña de aplicación para "Correo"

Para **Outlook/Hotmail**:
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@outlook.com
MAIL_PASSWORD=tu-contraseña
```

**OpenAI API Key:**
1. Crea una cuenta en https://platform.openai.com/
2. Ve a https://platform.openai.com/api-keys
3. Crea una nueva API key
4. Copia y pega en `OPENAI_API_KEY`

**Base de Datos:**
- Puerto: **5434** (asegúrate de que coincida con docker-compose)
- Las credenciales por defecto funcionan con el Docker Compose incluido
- Si cambias algo en `docker-compose.db.yml`, actualiza también el `.env`

**URLs de Frontend:**
- `LANDING_URL=http://localhost:3000` - Para links en emails hacia la landing
- `FRONTEND_URL=http://localhost:3001` - Para links hacia el dashboard admin

---

### 2. Frontend Admin (frontend-rrhh) - Puerto 3001

```bash
cd frontend-rrhh
cp .env.example .env.local
```

> **Nota:** Next.js usa `.env.local` para desarrollo local

#### Variables Críticas a Configurar:

**Backend API URL:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3010/api
```

**OpenAI API Key (opcional):**
- Usa la misma key que en el backend
- Se usa para funciones de chat en el dashboard

---

### 3. Landing Pública (elevas-landing) - Puerto 3000

```bash
cd elevas-landing
cp .env.example .env.local
```

#### Variables Críticas a Configurar:

**Backend API URL:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3010
```

**OpenAI API Key:**
- Necesaria para el chatbot EVA en la landing
- Usa la misma key que en el backend
```env
OPENAI_API_KEY=tu_api_key_de_openai
```

> **Nota:** EmailJS ya está configurado en el código de la landing. No necesitas variables de entorno adicionales para el formulario de contacto.

---

## Actualizar Docker Compose

Asegúrate de que el puerto de PostgreSQL esté correctamente configurado:

```bash
cd backend-rrhh
```

Edita `docker-compose.db.yml` y verifica que el puerto sea **5434**:

```yaml
ports:
  - "5434:5432"  # Puerto externo:interno
```

---

## Iniciar el Proyecto Completo

### Paso 1: Iniciar la Base de Datos

```bash
cd backend-rrhh
npm run db:start
```

Verifica que PostgreSQL esté corriendo en el puerto **5434**.

### Paso 2: Iniciar el Backend (Puerto 3010)

```bash
cd backend-rrhh

# Instalar dependencias (primera vez)
npm install

# Iniciar en modo desarrollo
npm run start:dev
```

El backend estará disponible en: **http://localhost:3010**

Verifica que funcione: http://localhost:3010/api

### Paso 3: Iniciar el Frontend Admin (Puerto 3001)

```bash
cd frontend-rrhh

# Instalar dependencias (primera vez)
npm install

# Iniciar en modo desarrollo
npm run dev
```

El dashboard admin estará disponible en: **http://localhost:3001**

### Paso 4: Iniciar la Landing Pública (Puerto 3000)

```bash
cd elevas-landing

# Instalar dependencias (primera vez)
npm install

# Iniciar en modo desarrollo
npm run dev
```

La landing estará disponible en: **http://localhost:3000**

Verifica la sección de postulaciones en: **http://localhost:3000/careers**

---

## Variables de Entorno Explicadas

### Backend (backend-rrhh)

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `PORT` | Puerto del servidor | **3010** | Sí |
| `NODE_ENV` | Entorno de ejecución | development | Sí |
| `DB_HOST` | Host de PostgreSQL | localhost | Sí |
| `DB_PORT` | Puerto de PostgreSQL | **5434** | Sí |
| `DB_USERNAME` | Usuario de base de datos | elevas_user | Sí |
| `DB_PASSWORD` | Contraseña de base de datos | elevas_pass123 | Sí |
| `DB_DATABASE` | Nombre de la base de datos | elevas_hr | Sí |
| `JWT_SECRET` | Secret para tokens JWT | - | **Sí** |
| `JWT_EXPIRES_IN` | Expiración del token | 24h | Sí |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens | - | **Sí** |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | 7d | Sí |
| `MAIL_HOST` | Servidor SMTP | - | **Sí** |
| `MAIL_PORT` | Puerto SMTP | 587 | Sí |
| `MAIL_SECURE` | Usar TLS | false | Sí |
| `MAIL_USER` | Usuario SMTP | - | **Sí** |
| `MAIL_PASSWORD` | Contraseña SMTP | - | **Sí** |
| `MAIL_FROM` | Email remitente | noreply@elevas.com | Sí |
| `LANDING_URL` | URL de la landing | http://localhost:3000 | Sí |
| `FRONTEND_URL` | URL del dashboard admin | http://localhost:3001 | Sí |
| `OPENAI_API_KEY` | API Key de OpenAI | - | **Sí*** |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limit | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests | 100 | No |
| `BCRYPT_SALT_ROUNDS` | Rounds de hash | 12 | No |

*Si no tienes API key de OpenAI, el sistema funcionará en modo simulación

### Frontend Admin (frontend-rrhh)

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `NEXT_PUBLIC_API_URL` | URL del backend API | http://localhost:3010/api | **Sí** |
| `OPENAI_API_KEY` | API Key de OpenAI | - | No* |

*Requerido solo si usas la función de chat

### Landing Pública (elevas-landing)

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend | http://localhost:3010 | **Sí** |
| `OPENAI_API_KEY` | API Key de OpenAI para EVA | - | **Sí*** |

*Requerido para el chatbot EVA. Si no está configurada, el chat no funcionará.

---

## Flujo de Datos: Sección "Postulate"

1. **Usuario visita** http://localhost:3000/careers
2. **Landing (elevas-landing)** solicita la lista de trabajos al backend:
   - GET `http://localhost:3010/api/jobs`
3. **Usuario completa** el formulario de postulación y sube su CV
4. **Landing envía** la aplicación al backend:
   - POST `http://localhost:3010/api/applications/public`
   - Payload: FormData con firstName, lastName, email, phone, dni, location, jobId, coverLetter, cv (PDF)
5. **Backend procesa** la aplicación:
   - Valida datos
   - Guarda en PostgreSQL (puerto 5434)
   - Opcionalmente analiza el CV con OpenAI
   - Envía email de confirmación
6. **Dashboard Admin (frontend-rrhh)** puede ver las postulaciones:
   - Accede a http://localhost:3001
   - Consulta al backend para ver aplicaciones

---

## Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo: `npm run db:start` en backend-rrhh
- Verifica las credenciales en `.env`
- Verifica que el puerto **5434** no esté en uso
- Verifica que `docker-compose.db.yml` use el puerto correcto

### Error: "Failed to fetch" en elevas-landing
- Verifica que el backend esté corriendo en puerto **3010**
- Verifica que `NEXT_PUBLIC_BACKEND_URL=http://localhost:3010` esté configurado
- Revisa la consola del navegador para ver la URL exacta que está intentando
- Verifica que no haya errores de CORS en el backend

### Error: "Failed to fetch" en frontend-rrhh
- Verifica que el backend esté corriendo en puerto **3010**
- Verifica que `NEXT_PUBLIC_API_URL=http://localhost:3010/api` esté configurado
- Revisa la consola del navegador

### Error de CORS
- Ya está configurado en el backend para permitir todas las origins en desarrollo
- Si el problema persiste, verifica los puertos

### Mensaje "No hay postulaciones abiertas"
- Este mensaje aparece cuando:
  1. El backend no está corriendo
  2. No hay trabajos publicados en la base de datos
  3. La conexión al backend falla
- Para ver postulaciones, primero crea trabajos desde el dashboard admin (http://localhost:3001)

### Emails no se envían
- Verifica tus credenciales SMTP en backend-rrhh
- Si usas Gmail, asegúrate de usar una "Contraseña de aplicación"
- Revisa los logs del backend para ver errores específicos

### OpenAI/EVA no funciona
- Verifica que tu API key sea válida
- Verifica que tengas créditos disponibles en tu cuenta de OpenAI
- En el backend, funcionará en "modo simulación" si no hay key
- En la landing, el chatbot no funcionará sin API key

### Conflicto de puertos
Si algún puerto está en uso:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3010
netstat -ano | findstr :5434

# Luego mata el proceso con:
taskkill /PID <número_de_proceso> /F
```

---

## Seguridad - IMPORTANTE

### Para Desarrollo Local:
- Los valores por defecto están bien para desarrollo
- Asegúrate de que los archivos `.env` estén en `.gitignore`

### Para Producción:
1. **NUNCA** subas archivos `.env` a Git
2. Cambia todos los secrets (JWT_SECRET, JWT_REFRESH_SECRET)
3. Usa contraseñas fuertes para la base de datos
4. Configura CORS para permitir solo tus dominios específicos
5. Usa HTTPS para todos los servicios
6. Usa variables de entorno del servidor (no archivos .env)
7. Considera usar un servicio de gestión de secrets (AWS Secrets Manager, Azure Key Vault, etc.)
8. Actualiza las URLs a tus dominios de producción:
   ```env
   # Backend
   LANDING_URL=https://www.elevasconsulting.com
   FRONTEND_URL=https://admin.elevasconsulting.com

   # Landing
   NEXT_PUBLIC_BACKEND_URL=https://api.elevasconsulting.com

   # Frontend Admin
   NEXT_PUBLIC_API_URL=https://api.elevasconsulting.com/api
   ```

---

## Comandos Útiles

### Base de Datos:
```bash
cd backend-rrhh
npm run db:start    # Iniciar PostgreSQL (puerto 5434)
npm run db:stop     # Detener PostgreSQL
npm run db:reset    # Resetear base de datos
npm run db:logs     # Ver logs del contenedor
```

### Desarrollo - Iniciar Todo:
```bash
# Terminal 1 - Base de datos
cd backend-rrhh
npm run db:start

# Terminal 2 - Backend (Puerto 3010)
cd backend-rrhh
npm run start:dev

# Terminal 3 - Frontend Admin (Puerto 3001)
cd frontend-rrhh
npm run dev

# Terminal 4 - Landing Pública (Puerto 3000)
cd elevas-landing
npm run dev
```

### Verificar que todo funciona:
- Backend API: http://localhost:3010/api
- Dashboard Admin: http://localhost:3001
- Landing Pública: http://localhost:3000
- Sección Postulate: http://localhost:3000/careers

---

## Próximos Pasos

### Checklist de Configuración:

#### Backend (backend-rrhh):
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar credenciales de email (SMTP)
- [ ] Obtener API key de OpenAI
- [ ] Generar JWT_SECRET y JWT_REFRESH_SECRET seguros
- [ ] Verificar puertos: PORT=3010, DB_PORT=5434
- [ ] Actualizar docker-compose.db.yml con puerto 5434
- [ ] Iniciar base de datos: `npm run db:start`
- [ ] Iniciar backend: `npm run start:dev`

#### Frontend Admin (frontend-rrhh):
- [ ] Copiar `.env.example` a `.env.local`
- [ ] Configurar NEXT_PUBLIC_API_URL=http://localhost:3010/api
- [ ] (Opcional) Configurar OpenAI API key
- [ ] Iniciar frontend: `npm run dev` (puerto 3001)

#### Landing Pública (elevas-landing):
- [ ] Copiar `.env.example` a `.env.local`
- [ ] Configurar NEXT_PUBLIC_BACKEND_URL=http://localhost:3010
- [ ] Configurar OPENAI_API_KEY para chatbot EVA
- [ ] Iniciar landing: `npm run dev` (puerto 3000)

#### Pruebas:
- [ ] Verificar que el backend responde en http://localhost:3010/api
- [ ] Crear un trabajo desde el dashboard admin
- [ ] Verificar que el trabajo aparezca en http://localhost:3000/careers
- [ ] Probar el formulario de postulación en la landing
- [ ] Verificar que la postulación llegue al backend y aparezca en el dashboard
- [ ] Probar el chatbot EVA en la landing
- [ ] Probar el envío de emails (reset de contraseña, etc.)

---

¿Necesitas ayuda con algún paso específico de la configuración?
