import { toast } from 'sonner'
import type { ExternalToast } from 'sonner'

export const useNotification = () => {
  return {
    // Notificación de éxito
    success: (message: string, description?: string) => {
      toast.success(message, {
        description,
        duration: 4000
      })
    },

    // Notificación de error
    error: (message: string, description?: string) => {
      toast.error(message, {
        description,
        duration: 5000
      })
    },

    // Notificación informativa
    info: (message: string, description?: string) => {
      toast.info(message, {
        description,
        duration: 4000
      })
    },

    // Notificación de advertencia
    warning: (message: string, description?: string) => {
      toast.warning(message, {
        description,
        duration: 4000
      })
    },

    // Notificación de carga (loading)
    loading: (message: string, description?: string) => {
      return toast.loading(message, {
        description
      })
    },

    // Actualizar una notificación existente (útil para loading -> success/error)
    update: (toastId: string | number, options: {
      type: 'success' | 'error' | 'info' | 'warning'
      message: string
      description?: string
    }) => {
      if (options.type === 'success') {
        toast.success(options.message, {
          id: toastId,
          description: options.description
        })
      } else if (options.type === 'error') {
        toast.error(options.message, {
          id: toastId,
          description: options.description
        })
      } else if (options.type === 'info') {
        toast.info(options.message, {
          id: toastId,
          description: options.description
        })
      } else if (options.type === 'warning') {
        toast.warning(options.message, {
          id: toastId,
          description: options.description
        })
      }
    },

    // Cerrar una notificación específica
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId)
    },

    // Notificación con promesa (para operaciones async)
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
      }
    ) => {
      return toast.promise(promise, messages)
    },

    // Notificación personalizada
    custom: (jsx: (id: string | number) => React.ReactElement, options?: ExternalToast) => {
      return toast.custom(jsx, options)
    }
  }
}

// Helper para operaciones CRUD comunes
export const notifyOperation = {
  created: (entity: string) => toast.success(`${entity} creado exitosamente`),
  updated: (entity: string) => toast.success(`${entity} actualizado exitosamente`),
  deleted: (entity: string) => toast.success(`${entity} eliminado exitosamente`),
  error: (operation: string, error?: string) =>
    toast.error(`Error al ${operation}`, { description: error }),

  // Para operaciones específicas
  userCreated: () => toast.success('Usuario creado exitosamente'),
  userUpdated: () => toast.success('Usuario actualizado exitosamente'),
  userDeleted: () => toast.success('Usuario eliminado exitosamente'),

  candidateCreated: () => toast.success('Candidato creado exitosamente'),
  candidateUpdated: () => toast.success('Candidato actualizado exitosamente'),

  jobCreated: () => toast.success('Puesto de trabajo creado exitosamente'),
  jobUpdated: () => toast.success('Puesto de trabajo actualizado exitosamente'),
  jobDeleted: () => toast.success('Puesto de trabajo eliminado exitosamente'),

  applicationReceived: () => toast.success('Postulación recibida exitosamente'),
  applicationUpdated: () => toast.success('Postulación actualizada exitosamente'),

  interviewScheduled: () => toast.success('Entrevista programada exitosamente'),
  interviewUpdated: () => toast.success('Entrevista actualizada exitosamente'),

  saveError: () => toast.error('Error al guardar los cambios'),
  loadError: () => toast.error('Error al cargar los datos'),
  deleteError: () => toast.error('Error al eliminar'),

  unauthorized: () => toast.error('No tienes permisos para realizar esta acción'),
  sessionExpired: () => toast.error('Tu sesión ha expirado', { description: 'Por favor inicia sesión nuevamente' })
}
