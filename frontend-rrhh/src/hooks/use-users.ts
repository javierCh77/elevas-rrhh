import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '@/lib/users-api'
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserFilters,
  UserSearchFilters
} from '@/lib/types'
import { toast } from 'sonner'

interface UseUsersReturn {
  users: User[]
  isLoading: boolean
  error: string | null
  totalUsers: number
  stats: {
    total: number
    active: number
    inactive: number
    suspended: number
    admins: number
  } | null

  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>
  createUser: (userData: CreateUserDTO) => Promise<User | null>
  updateUser: (id: string, userData: UpdateUserDTO) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended') => Promise<User | null>
  refreshUsers: () => Promise<void>
  clearError: () => void
}

export const useUsers = (initialFilters?: UserFilters): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    total: number
    active: number
    inactive: number
    suspended: number
    admins: number
  } | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedUsers = await usersApi.getUsers(filters)
      setUsers(fetchedUsers)

      // Calculate stats from fetched users
      const userStats = {
        total: fetchedUsers.length,
        active: fetchedUsers.filter(u => u.status === 'active').length,
        inactive: fetchedUsers.filter(u => u.status === 'inactive').length,
        suspended: fetchedUsers.filter(u => u.status === 'suspended').length,
        admins: fetchedUsers.filter(u => u.role === 'admin').length
      }
      setStats(userStats)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios'
      setError(errorMessage)
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createUser = useCallback(async (userData: CreateUserDTO): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const newUser = await usersApi.createUser(userData)

      // Add new user to the list
      setUsers(prev => [newUser, ...prev])

      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        [newUser.status]: prev[newUser.status] + 1,
        admins: newUser.role === 'admin' ? prev.admins + 1 : prev.admins
      } : null)

      toast.success('Usuario creado exitosamente', {
        description: `${newUser.firstName} ${newUser.lastName} ha sido agregado al sistema`
      })

      return newUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario'
      setError(errorMessage)
      toast.error('Error al crear usuario', {
        description: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: string, userData: UpdateUserDTO): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await usersApi.updateUser(id, userData)

      // Update user in the list
      setUsers(prev => prev.map(user =>
        user.id === id ? updatedUser : user
      ))

      toast.success('Usuario actualizado exitosamente', {
        description: `Los datos de ${updatedUser.firstName} ${updatedUser.lastName} han sido actualizados`
      })

      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario'
      setError(errorMessage)
      toast.error('Error al actualizar usuario', {
        description: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await usersApi.deleteUser(id)

      // Remove user from the list
      const userToDelete = users.find(u => u.id === id)
      setUsers(prev => prev.filter(user => user.id !== id))

      // Update stats
      if (userToDelete) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          [userToDelete.status]: Math.max(0, prev[userToDelete.status] - 1),
          admins: userToDelete.role === 'admin' ? Math.max(0, prev.admins - 1) : prev.admins
        } : null)
      }

      toast.success('Usuario eliminado exitosamente', {
        description: userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName} ha sido eliminado del sistema` : undefined
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario'
      setError(errorMessage)
      toast.error('Error al eliminar usuario', {
        description: errorMessage
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [users])

  const updateUserStatus = useCallback(async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await usersApi.updateUserStatus(id, status)

      // Update user in the list
      setUsers(prev => prev.map(user =>
        user.id === id ? updatedUser : user
      ))

      const statusMessages = {
        active: 'activado',
        inactive: 'desactivado',
        suspended: 'suspendido'
      }

      toast.success(`Usuario ${statusMessages[status]} exitosamente`, {
        description: `${updatedUser.firstName} ${updatedUser.lastName} ha sido ${statusMessages[status]}`
      })

      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado del usuario'
      setError(errorMessage)
      toast.error('Error al actualizar estado', {
        description: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUsers = useCallback(async () => {
    await fetchUsers(initialFilters)
  }, [fetchUsers, initialFilters])

  // Initial fetch
  useEffect(() => {
    fetchUsers(initialFilters)
  }, [fetchUsers, initialFilters])

  return {
    users,
    isLoading,
    error,
    totalUsers: stats?.total || 0,
    stats,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    refreshUsers,
    clearError
  }
}

// Hook for single user management
interface UseSingleUserReturn {
  user: User | null
  isLoading: boolean
  error: string | null

  fetchUser: (id: string) => Promise<void>
  updateUser: (userData: UpdateUserDTO) => Promise<User | null>
  clearError: () => void
}

export const useSingleUser = (id?: string): UseSingleUserReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchUser = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedUser = await usersApi.getUserById(userId)
      setUser(fetchedUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuario'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (userData: UpdateUserDTO): Promise<User | null> => {
    if (!user) return null

    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await usersApi.updateUser(user.id, userData)
      setUser(updatedUser)

      toast.success('Usuario actualizado exitosamente', {
        description: `Los datos de ${updatedUser.firstName} ${updatedUser.lastName} han sido actualizados`
      })

      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario'
      setError(errorMessage)
      toast.error('Error al actualizar usuario', {
        description: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Initial fetch if ID is provided
  useEffect(() => {
    if (id) {
      fetchUser(id)
    }
  }, [id, fetchUser])

  return {
    user,
    isLoading,
    error,
    fetchUser,
    updateUser,
    clearError
  }
}

// Hook for user search and filtering
export const useUserSearch = () => {
  const [searchFilters, setSearchFilters] = useState<UserSearchFilters>({
    searchTerm: '',
    roleFilter: 'all',
    statusFilter: 'all',
    currentPage: 1,
    itemsPerPage: 10
  })

  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  const updateFilters = useCallback((updates: Partial<UserSearchFilters>) => {
    setSearchFilters(prev => ({
      ...prev,
      ...updates,
      // Reset page when other filters change
      currentPage: updates.currentPage || 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearchFilters({
      searchTerm: '',
      roleFilter: 'all',
      statusFilter: 'all',
      currentPage: 1,
      itemsPerPage: 10
    })
  }, [])

  return {
    searchFilters,
    filteredUsers,
    updateFilters,
    resetFilters,
    setFilteredUsers
  }
}