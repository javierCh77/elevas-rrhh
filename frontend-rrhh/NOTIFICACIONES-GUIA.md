# 🔔 Guía de Sistema de Notificaciones - Sonner

## Sistema Unificado de Notificaciones

Hemos implementado **Sonner** como sistema único de notificaciones con diseño liquid glass personalizado.

---

## 📦 Importación

```typescript
import { useNotification, notifyOperation } from '@/hooks/useNotification'
```

---

## 🎯 Uso Básico

### En un Componente

```typescript
'use client'

import { useNotification } from '@/hooks/useNotification'

export default function MiComponente() {
  const notify = useNotification()

  const handleSave = async () => {
    try {
      await saveData()
      notify.success('¡Guardado exitosamente!')
    } catch (error) {
      notify.error('Error al guardar', error.message)
    }
  }

  return <button onClick={handleSave}>Guardar</button>
}
```

---

## 📋 Tipos de Notificaciones

### 1. Success (Éxito)
```typescript
notify.success('Usuario creado exitosamente')
notify.success('Guardado', 'Los cambios se guardaron correctamente')
```

### 2. Error
```typescript
notify.error('Error al cargar datos')
notify.error('Error crítico', 'No se pudo conectar al servidor')
```

### 3. Info (Información)
```typescript
notify.info('Procesando solicitud')
notify.info('Actualización disponible', 'Hay una nueva versión')
```

### 4. Warning (Advertencia)
```typescript
notify.warning('Acción irreversible')
notify.warning('Atención', 'Esto eliminará todos los datos')
```

### 5. Loading (Cargando)
```typescript
const toastId = notify.loading('Procesando...')
// Después actualizar:
notify.update(toastId, {
  type: 'success',
  message: '¡Completado!',
  description: 'Se procesaron 100 registros'
})
```

---

## 🚀 Operaciones Comunes (Shortcuts)

### Para Crear, Editar, Eliminar

```typescript
import { notifyOperation } from '@/hooks/useNotification'

// Crear
const handleCreate = async () => {
  try {
    await createUser(data)
    notifyOperation.userCreated() // ✅ "Usuario creado exitosamente"
  } catch (error) {
    notifyOperation.saveError() // ❌ "Error al guardar los cambios"
  }
}

// Actualizar
const handleUpdate = async () => {
  await updateUser(data)
  notifyOperation.userUpdated() // ✅ "Usuario actualizado exitosamente"
}

// Eliminar
const handleDelete = async () => {
  await deleteUser(id)
  notifyOperation.userDeleted() // ✅ "Usuario eliminado exitosamente"
}
```

### Operaciones Disponibles

```typescript
// Usuarios
notifyOperation.userCreated()
notifyOperation.userUpdated()
notifyOperation.userDeleted()

// Candidatos
notifyOperation.candidateCreated()
notifyOperation.candidateUpdated()

// Trabajos
notifyOperation.jobCreated()
notifyOperation.jobUpdated()
notifyOperation.jobDeleted()

// Postulaciones
notifyOperation.applicationReceived()
notifyOperation.applicationUpdated()

// Entrevistas
notifyOperation.interviewScheduled()
notifyOperation.interviewUpdated()

// Errores comunes
notifyOperation.saveError()
notifyOperation.loadError()
notifyOperation.deleteError()
notifyOperation.unauthorized()
notifyOperation.sessionExpired()

// Genéricas
notifyOperation.created('Candidato') // "Candidato creado exitosamente"
notifyOperation.updated('Trabajo') // "Trabajo actualizado exitosamente"
notifyOperation.deleted('Nota') // "Nota eliminada exitosamente"
```

---

## ⚡ Operaciones Async con Promise

Para operaciones asíncronas con loading automático:

```typescript
const notify = useNotification()

const handleAsyncOperation = () => {
  notify.promise(
    saveDataToAPI(),
    {
      loading: 'Guardando datos...',
      success: 'Datos guardados correctamente',
      error: 'Error al guardar datos'
    }
  )
}

// O con mensajes dinámicos:
notify.promise(
  fetchUsers(),
  {
    loading: 'Cargando usuarios...',
    success: (data) => `Se cargaron ${data.length} usuarios`,
    error: (err) => `Error: ${err.message}`
  }
)
```

---

## 🎨 Ejemplos Completos por Módulo

### Módulo de Usuarios

```typescript
'use client'

import { useNotification, notifyOperation } from '@/hooks/useNotification'

export default function UsersPage() {
  const notify = useNotification()

  const handleCreateUser = async (data) => {
    const toastId = notify.loading('Creando usuario...')

    try {
      await api.post('/users', data)
      notify.update(toastId, {
        type: 'success',
        message: 'Usuario creado exitosamente'
      })
      router.push('/dashboard/users')
    } catch (error) {
      notify.update(toastId, {
        type: 'error',
        message: 'Error al crear usuario',
        description: error.message
      })
    }
  }

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`)
      notifyOperation.userDeleted()
    } catch (error) {
      notifyOperation.deleteError()
    }
  }

  return (...)
}
```

### Módulo de Candidatos

```typescript
const handleApplicationSubmit = async (formData) => {
  notify.promise(
    api.post('/applications', formData),
    {
      loading: 'Enviando postulación...',
      success: 'Postulación recibida exitosamente',
      error: 'Error al enviar la postulación'
    }
  )
}
```

### Módulo de Trabajos

```typescript
const handleJobCreate = async (jobData) => {
  try {
    await api.post('/jobs', jobData)
    notifyOperation.jobCreated()
    router.push('/dashboard/jobs')
  } catch (error) {
    if (error.status === 401) {
      notifyOperation.unauthorized()
    } else {
      notifyOperation.saveError()
    }
  }
}
```

---

## 🔄 Migración desde Alert/Toast Anterior

### Antes (Alert)
```typescript
alert('Usuario creado')
window.alert('Error al guardar')
```

### Ahora (Sonner)
```typescript
notify.success('Usuario creado')
notify.error('Error al guardar')
```

### Antes (Toast genérico)
```typescript
toast.success('Guardado')
toast.error('Error')
```

### Ahora (useNotification)
```typescript
const notify = useNotification()
notify.success('Guardado')
notify.error('Error')
```

---

## 🎨 Personalización

El diseño ya está configurado con tu paleta de colores:
- **Fondo:** Liquid glass effect con blur 20px
- **Bordes:** Dorado translúcido (#cfaf6e)
- **Sombras:** Multicapa con highlight interno
- **Colores:** Success (verde), Error (rojo), Info (azul), Warning (amarillo)

---

## ✅ Mejores Prácticas

1. **Usa shortcuts para operaciones comunes:**
   ```typescript
   ✅ notifyOperation.userCreated()
   ❌ notify.success('Usuario creado exitosamente')
   ```

2. **Proporciona descripciones en errores:**
   ```typescript
   ✅ notify.error('Error al guardar', error.message)
   ❌ notify.error('Error')
   ```

3. **Usa loading + update para operaciones largas:**
   ```typescript
   const id = notify.loading('Procesando...')
   // ... operación
   notify.update(id, { type: 'success', message: 'Listo!' })
   ```

4. **Usa promise para operaciones async simples:**
   ```typescript
   notify.promise(fetchData(), {
     loading: 'Cargando...',
     success: 'Datos cargados',
     error: 'Error al cargar'
   })
   ```

---

## 📍 Posición de las Notificaciones

Las notificaciones aparecen en la esquina **superior derecha** (`top-right`) con:
- Duración: 4 segundos (5 para errores)
- Botón de cerrar
- Stack automático
- Animaciones suaves

---

## 🚫 Qué NO Hacer

❌ No uses `alert()` nativo
❌ No uses `window.confirm()` para confirmaciones (usa un Dialog)
❌ No uses `console.log()` para notificar al usuario
❌ No uses múltiples sistemas de notificaciones

✅ Usa siempre `useNotification` hook
✅ Usa `notifyOperation` para operaciones CRUD
✅ Mantén mensajes cortos y claros
✅ Proporciona contexto en descripciones

---

## 🎯 Resumen

```typescript
// Importar
import { useNotification, notifyOperation } from '@/hooks/useNotification'

// Usar en componente
const notify = useNotification()

// Notificaciones básicas
notify.success('Mensaje')
notify.error('Error', 'Descripción')
notify.info('Info')
notify.warning('Advertencia')

// Shortcuts CRUD
notifyOperation.userCreated()
notifyOperation.saveError()

// Async con loading
const id = notify.loading('Cargando...')
notify.update(id, { type: 'success', message: 'Listo!' })

// Promise
notify.promise(operation(), {
  loading: 'Procesando...',
  success: 'Completado',
  error: 'Error'
})
```

---

**¡Listo! Ahora tienes un sistema de notificaciones unificado, elegante y fácil de usar en toda tu aplicación!** 🎉
