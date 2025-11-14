import { api } from './api'
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResponse
} from './types'

export type { LoginCredentials, User }
export type LoginResponse = AuthResponse

// Auth API Service
export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    // Store tokens in localStorage
    this.storeTokens(response.tokens)
    this.storeUser(response.user)

    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)

    // Store tokens in localStorage
    this.storeTokens(response.tokens)
    this.storeUser(response.user)

    return response
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getStoredRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken
    })

    this.storeTokens(response)
    return response
  }

  async logout(): Promise<void> {
    const token = this.getStoredToken()

    // Call backend logout endpoint to blacklist token
    if (token) {
      try {
        await api.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } catch (error: unknown) {
        // Even if backend call fails, clear local storage
        if (process.env.NODE_ENV === 'development') {
          console.warn('Backend logout failed:', error)
        }
      }
    }

    this.clearStorage()
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('auth_user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    const token = localStorage.getItem('auth_token')
    if (!token) return false

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000

      if (payload.exp && payload.exp < now) {
        // Token expired, clear storage
        this.clearStorage()
        return false
      }

      return true
    } catch {
      // Invalid token, clear storage
      this.clearStorage()
      return false
    }
  }

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_refresh_token')
  }

  private storeTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return

    localStorage.setItem('auth_token', tokens.accessToken)
    localStorage.setItem('auth_refresh_token', tokens.refreshToken)
  }

  private storeUser(user: User): void {
    if (typeof window === 'undefined') return

    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
  }
}

// Export singleton instance
export const authService = new AuthService()