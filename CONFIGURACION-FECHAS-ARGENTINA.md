# Configuración de Fechas - Zona Horaria Argentina

## Resumen

Toda la aplicación (frontend y backend) está configurada para trabajar con la zona horaria de Argentina (`America/Argentina/Buenos_Aires`) y utiliza el formato de fecha **dd/MM/yyyy** de manera consistente.

---

## Backend (NestJS)

### Configuración de Zona Horaria

**Archivo**: `backend-rrhh/src/main.ts`

```typescript
async function bootstrap() {
  // Set timezone to Argentina
  process.env.TZ = 'America/Argentina/Buenos_Aires';

  // ... resto de la configuración
}
```

Esta configuración asegura que todas las operaciones de fecha en el servidor Node.js se realicen en la zona horaria de Argentina.

### Almacenamiento en Base de Datos

- Las fechas se almacenan en formato **ISO 8601** en la base de datos PostgreSQL
- PostgreSQL automáticamente maneja la zona horaria configurada
- Las fechas incluyen información de timezone para evitar ambigüedades

---

## Frontend (Next.js + React)

### Utilidades de Fecha

**Archivo**: `frontend-rrhh/src/lib/date-utils.ts`

Este archivo contiene todas las funciones de utilidad para manejar fechas:

#### Funciones Principales

##### `formatDateAR(date)`
Formatea una fecha al formato argentino **dd/MM/yyyy**

```typescript
formatDateAR('2024-12-25T10:00:00Z')
// Output: "25/12/2024"
```

##### `formatDateTimeAR(date)`
Formatea una fecha con hora al formato **dd/MM/yyyy HH:mm**

```typescript
formatDateTimeAR('2024-12-25T14:30:00Z')
// Output: "25/12/2024 14:30"
```

##### `toInputDateFormat(dateStr)`
Convierte dd/MM/yyyy a yyyy-MM-dd (para inputs HTML)

```typescript
toInputDateFormat('25/12/2024')
// Output: "2024-12-25"
```

##### `fromInputDateFormat(inputDate)`
Convierte yyyy-MM-dd (de input HTML) a ISO string para API

```typescript
fromInputDateFormat('2024-12-25')
// Output: "2024-12-25T00:00:00.000Z"
```

##### `getCurrentDateAR()`
Obtiene la fecha actual en Argentina en formato yyyy-MM-dd

```typescript
getCurrentDateAR()
// Output: "2024-12-25" (fecha actual en Argentina)
```

##### `getDatePlaceholder()`
Retorna el placeholder para inputs de fecha

```typescript
getDatePlaceholder()
// Output: "dd/mm/aaaa"
```

##### `formatRelativeDateAR(date)`
Formatea fechas relativas en español

```typescript
formatRelativeDateAR(pastDate)
// Output: "hace 2 días", "hace 3 horas", etc.
```

---

## Implementación en Componentes

### Formularios (Crear/Editar Puestos)

#### Input de Fecha

```tsx
import { fromInputDateFormat, getDatePlaceholder } from '@/lib/date-utils'

// En el componente
<Input
  type="date"
  value={formData.deadline}
  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
  placeholder={getDatePlaceholder()}
/>

// Al enviar al backend
const jobData = {
  // ... otros campos
  deadline: fromInputDateFormat(formData.deadline) // Convierte a ISO
}
```

#### Carga de Datos

```tsx
import { toInputDateFormat } from '@/lib/date-utils'

// Al cargar datos del backend
setFormData({
  // ... otros campos
  deadline: foundJob.deadline ? toInputDateFormat(foundJob.deadline) : ''
})
```

### Vistas de Listado

```tsx
import { formatDateAR, formatDateTimeAR } from '@/lib/date-utils'

// Mostrar solo fecha
<span>{formatDateAR(job.deadline)}</span>
// Output: "25/12/2024"

// Mostrar fecha y hora
<span>{formatDateTimeAR(job.createdAt)}</span>
// Output: "25/12/2024 14:30"
```

---

## Ejemplos de Uso Completo

### Crear Puesto de Trabajo

```tsx
// frontend-rrhh/src/app/dashboard/jobs/create/page.tsx

import { fromInputDateFormat, getDatePlaceholder } from '@/lib/date-utils'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const jobData = {
    title: formData.title,
    department: formData.department,
    // ... otros campos
    deadline: fromInputDateFormat(formData.deadline), // "2024-12-25" -> ISO
    status: 'active'
  }

  await api.post('/jobs', jobData)
}
```

### Editar Puesto de Trabajo

```tsx
// frontend-rrhh/src/app/dashboard/jobs/[id]/edit/page.tsx

import { toInputDateFormat, fromInputDateFormat } from '@/lib/date-utils'

// Cargar datos
useEffect(() => {
  if (foundJob) {
    setFormData({
      // ... otros campos
      deadline: foundJob.deadline ? toInputDateFormat(foundJob.deadline) : ''
      // ISO -> "2024-12-25"
    })
  }
}, [foundJob])

// Guardar cambios
const handleSubmit = async () => {
  const updatedJobData = {
    ...formData,
    deadline: formData.deadline ? fromInputDateFormat(formData.deadline) : undefined
    // "2024-12-25" -> ISO
  }

  await updateJob(jobId, updatedJobData)
}
```

### Mostrar Fechas en Listados

```tsx
// frontend-rrhh/src/app/dashboard/jobs/page.tsx

import { formatDateAR, formatDateTimeAR } from '@/lib/date-utils'

// En la tarjeta del puesto
<span>Hasta {formatDateAR(job.deadline)}</span>
// Output: "Hasta 25/12/2024"

// En detalles con hora
<p>{formatDateTimeAR(job.createdAt)}</p>
// Output: "25/12/2024 14:30"
```

---

## Archivos Actualizados

### Backend
- ✅ `backend-rrhh/src/main.ts` - Configuración de timezone Argentina

### Frontend - Utilidades
- ✅ `frontend-rrhh/src/lib/date-utils.ts` - Funciones de utilidad (NUEVO)

### Frontend - Formularios
- ✅ `frontend-rrhh/src/app/dashboard/jobs/create/page.tsx` - Crear puesto
- ✅ `frontend-rrhh/src/app/dashboard/jobs/[id]/edit/page.tsx` - Editar puesto

### Frontend - Vistas
- ✅ `frontend-rrhh/src/app/dashboard/jobs/page.tsx` - Listado de puestos
- ✅ `frontend-rrhh/src/app/dashboard/jobs/[id]/page.tsx` - Detalle de puesto

---

## Formatos Utilizados

### Input HTML (type="date")
- **Formato interno**: `yyyy-MM-dd` (requerido por HTML5)
- **Placeholder**: `dd/mm/aaaa`
- **Conversión**: Automática con `toInputDateFormat()` y `fromInputDateFormat()`

### API (Backend)
- **Formato**: ISO 8601 (`2024-12-25T00:00:00.000Z`)
- **Zona horaria**: America/Argentina/Buenos_Aires

### Display (UI)
- **Formato corto**: `dd/MM/yyyy` (ej: 25/12/2024)
- **Formato con hora**: `dd/MM/yyyy HH:mm` (ej: 25/12/2024 14:30)
- **Locale**: `es-AR`

---

## Próximos Pasos (Pendientes)

Los siguientes archivos también contienen fechas y deberían ser actualizados usando las mismas utilidades:

### Alta Prioridad
- [ ] `frontend-rrhh/src/app/dashboard/candidates/page.tsx`
- [ ] `frontend-rrhh/src/app/dashboard/candidates/[id]/page.tsx`
- [ ] `frontend-rrhh/src/app/dashboard/interviews/page.tsx`

### Media Prioridad
- [ ] `frontend-rrhh/src/app/dashboard/users/page.tsx`
- [ ] `frontend-rrhh/src/app/dashboard/users/[id]/page.tsx`
- [ ] `frontend-rrhh/src/app/dashboard/selection-processes/page.tsx`
- [ ] `frontend-rrhh/src/app/dashboard/selection-processes/[id]/page.tsx`

### Baja Prioridad
- [ ] `frontend-rrhh/src/app/dashboard/suggestions/page.tsx`
- [ ] `frontend-rrhh/src/app/dashboard/cv-analysis/page.tsx`
- [ ] `frontend-rrhh/src/components/dashboard/hr-quote-card.tsx`

---

## Validación y Testing

### Checklist de Verificación

- ✅ Backend configurado con timezone de Argentina
- ✅ Funciones de utilidad creadas y documentadas
- ✅ Formularios de creación usan `fromInputDateFormat()`
- ✅ Formularios de edición usan `toInputDateFormat()` al cargar
- ✅ Formularios de edición usan `fromInputDateFormat()` al guardar
- ✅ Vistas muestran fechas con `formatDateAR()`
- ✅ Timestamps muestran fecha y hora con `formatDateTimeAR()`
- ✅ Placeholders usan `getDatePlaceholder()`

### Casos de Prueba

1. **Crear un nuevo puesto**
   - Seleccionar fecha límite
   - Verificar que se guarda correctamente
   - Verificar que se muestra en formato dd/MM/yyyy

2. **Editar un puesto existente**
   - Verificar que la fecha se carga correctamente en el input
   - Modificar la fecha
   - Guardar y verificar el formato

3. **Visualizar listados**
   - Verificar que todas las fechas se muestran en formato dd/MM/yyyy
   - Verificar timestamps con hora en formato dd/MM/yyyy HH:mm

4. **Timezone**
   - Crear un registro desde Argentina
   - Verificar que la hora corresponda a la zona horaria correcta
   - No debe haber desfasaje de horas

---

## Notas Importantes

1. **Siempre usar las funciones de utilidad** - No formatear fechas manualmente
2. **No usar `new Date().toLocaleDateString()`** directamente - Usar `formatDateAR()` o `formatDateTimeAR()`
3. **Inputs HTML requieren formato yyyy-MM-dd** - Siempre usar `toInputDateFormat()` y `fromInputDateFormat()`
4. **El backend espera ISO strings** - Usar `fromInputDateFormat()` antes de enviar a la API
5. **Timezone siempre en Argentina** - Configurado en backend y funciones de frontend

---

## Soporte

Para cualquier duda o problema con fechas, revisar:
1. Este documento
2. `frontend-rrhh/src/lib/date-utils.ts` - Código fuente de las utilidades
3. Ejemplos en `jobs/create/page.tsx` y `jobs/[id]/edit/page.tsx`
