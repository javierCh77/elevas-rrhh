import { api } from './api'
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserFilters,
  UserFormData,
} from './types'

export class UsersApiService {
  private readonly endpoint = '/users'

  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.search) {
        queryParams.append('search', filters.search)
      }
      if (filters?.role && filters.role !== 'all') {
        queryParams.append('role', filters.role)
      }
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status)
      }
      if (filters?.department) {
        queryParams.append('department', filters.department)
      }
      if (filters?.page) {
        queryParams.append('page', filters.page.toString())
      }
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString())
      }

      const queryString = queryParams.toString()
      const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint

      const response = await api.get<User[]>(endpoint)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching users:', error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`${this.endpoint}/${id}`)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error fetching user ${id}:`, error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      const response = await api.post<User>(this.endpoint, userData)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating user:', error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    try {
      const response = await api.patch<User>(`${this.endpoint}/${id}`, userData)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error updating user ${id}:`, error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error deleting user ${id}:`, error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await api.patch<User>(`${this.endpoint}/${id}/toggle-active`)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error toggling user status ${id}:`, error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Update user status specifically
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> {
    try {
      const response = await api.patch<User>(`${this.endpoint}/${id}/status`, { status })
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error updating user status ${id}:`, error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Reset user password (admin/HR only)
   */
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    try {
      await api.patch(`${this.endpoint}/${id}`, { password: newPassword })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error resetting password for user ${id}:`, error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    suspended: number
    admins: number
    byRole: Record<string, number>
    byDepartment: Record<string, number>
  }> {
    try {
      // Since backend might not have a specific stats endpoint,
      // we'll fetch all users and calculate stats on frontend
      const users = await this.getUsers()

      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        admins: users.filter(u => u.role === 'admin').length,
        byRole: {} as Record<string, number>,
        byDepartment: {} as Record<string, number>
      }

      // Calculate role distribution
      users.forEach(user => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1
      })

      // Calculate department distribution
      users.forEach(user => {
        if (user.department) {
          stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching user stats:', error)
      }
      throw this.handleApiError(error)
    }
  }

  /**
   * Search users with advanced filters
   */
  async searchUsers(searchTerm: string, filters?: Omit<UserFilters, 'search'>): Promise<User[]> {
    return this.getUsers({
      ...filters,
      search: searchTerm
    })
  }

  /**
   * Handle API errors and provide user-friendly messages
   */
  private handleApiError(error: unknown): Error {
    if (error instanceof Error) {
      // Check for specific HTTP status codes and provide better messages
      if (error.message.includes('401')) {
        return new Error('No tienes permisos para realizar esta acción')
      }
      if (error.message.includes('403')) {
        return new Error('Tu cuenta está bloqueada o inactiva')
      }
      if (error.message.includes('404')) {
        return new Error('Usuario no encontrado')
      }
      if (error.message.includes('409')) {
        return new Error('El email ya está registrado')
      }
      if (error.message.includes('400')) {
        return new Error('Datos inválidos. Verifica la información ingresada')
      }
      if (error.message.includes('500')) {
        return new Error('Error interno del servidor. Intenta más tarde')
      }

      return error
    }

    return new Error('Error desconocido al procesar la solicitud')
  }

  /**
   * Check if current user can perform actions on target user
   */
  async canManageUser(currentUser: User, targetUserId: string): Promise<boolean> {
    // Admins can manage everyone
    if (currentUser.role === 'admin') {
      return true
    }

    // HR can manage non-admin users
    if (currentUser.role === 'hr') {
      try {
        const targetUser = await this.getUserById(targetUserId)
        return targetUser.role !== 'admin'
      } catch {
        return false
      }
    }

    // Other roles can only view
    return false
  }
}

// Export singleton instance
export const usersApi = new UsersApiService()

// Utility functions for form handling
export const mapUserToFormData = (user: User) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  department: user.department || '',
  position: user.position || '',
  phone: user.phone || '',
  status: user.status,
  changePassword: false,
  newPassword: '',
  confirmPassword: ''
})

export const mapFormDataToUpdateDTO = (formData: UserFormData): UpdateUserDTO => {
  const dto: UpdateUserDTO = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    role: formData.role || undefined,
    department: formData.department || undefined,
    position: formData.position || undefined,
    phone: formData.phone || undefined
  }

  // Only include password if changing it
  if (formData.changePassword && formData.newPassword) {
    dto.password = formData.newPassword
  }

  // Remove empty strings and convert to undefined
  Object.keys(dto).forEach(key => {
    if (dto[key as keyof UpdateUserDTO] === '') {
      delete dto[key as keyof UpdateUserDTO]
    }
  })

  return dto
}

export const mapFormDataToCreateDTO = (formData: UserFormData & { password: string }): CreateUserDTO => {
  return {
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    role: formData.role || 'employee',
    department: formData.department || undefined,
    position: formData.position || undefined,
    phone: formData.phone || undefined
  }
}