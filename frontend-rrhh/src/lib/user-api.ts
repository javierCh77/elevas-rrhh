import { api } from './api'
import type { User } from './types'

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  department?: string
  position?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

export interface UserPreferences {
  emailNotifications?: boolean
  newApplications?: boolean
  interviewReminders?: boolean
  systemUpdates?: boolean
  weeklyReport?: boolean
  twoFactorAuth?: boolean
  sessionTimeout?: boolean
  loginAlerts?: boolean
}

export const userApi = {
  /**
   * Actualiza el perfil del usuario actual
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    return await api.patch<User>(`/users/${userId}`, data)
  },

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    return await api.post<ChangePasswordResponse>('/auth/change-password', data)
  },

  /**
   * Actualiza las preferencias del usuario
   * Por ahora se guardará en localStorage hasta que tengamos un endpoint en el backend
   */
  async updatePreferences(userId: string, preferences: UserPreferences) {
    // TODO: Cuando el backend tenga un endpoint para preferencias, descomentar esto:
    // const response = await apiClient.patch(`/users/${userId}/preferences`, preferences)
    // return response.data

    // Por ahora guardar en localStorage
    localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(preferences))
    return preferences
  },

  /**
   * Obtiene las preferencias del usuario
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    // TODO: Cuando el backend tenga un endpoint para preferencias, descomentar esto:
    // const response = await apiClient.get(`/users/${userId}/preferences`)
    // return response.data

    // Por ahora leer de localStorage
    const stored = localStorage.getItem(`user_preferences_${userId}`)
    return stored ? JSON.parse(stored) : {
      emailNotifications: true,
      newApplications: true,
      interviewReminders: true,
      systemUpdates: false,
      weeklyReport: true,
      twoFactorAuth: false,
      sessionTimeout: true,
      loginAlerts: true
    }
  }
}
