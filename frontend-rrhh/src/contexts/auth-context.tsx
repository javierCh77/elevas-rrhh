'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, type User, type LoginCredentials } from '@/lib/auth'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper functions
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getRoleDisplayName(role: string): string {
  const roleNames = {
    admin: 'Administrador',
    hr: 'Recursos Humanos',
    manager: 'Gerente',
    employee: 'Empleado'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Debug log whenever isAuthenticated changes
  useEffect(() => {
    console.log('AuthContext: isAuthenticated changed to:', isAuthenticated, 'user:', user)
  }, [isAuthenticated, user])

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const storedUser = authService.getCurrentUser()
        const hasToken = authService.isAuthenticated()

        console.log('AuthContext initializing:', { storedUser, hasToken })

        if (storedUser && hasToken) {
          setUser(storedUser)
          console.log('AuthContext: User set from localStorage', storedUser)
        } else {
          console.log('AuthContext: No valid user/token found')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Login attempt with', credentials.email)
      const response = await authService.login(credentials)
      console.log('AuthContext: Login successful, setting user', response.user)
      setUser(response.user)

      // Show welcome toast
      const user = response.user
      const greeting = getGreeting()
      toast.success(`¡${greeting}, ${user.firstName}!`, {
        description: `Bienvenido de vuelta. Rol: ${getRoleDisplayName(user.role)}`,
        duration: 4000,
        className: 'welcome-toast',
        style: {
          background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)',
          borderColor: '#cfaf6e',
          color: '#a37d43'
        }
      })
    } catch (error) {
      console.error('AuthContext: Login failed', error)
      throw error
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const refreshToken = async () => {
    try {
      await authService.refreshToken()
      // Token refreshed successfully, user remains the same
    } catch (error) {
      // Refresh failed, logout user
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#cfaf6e]"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login would happen here
      // For now, we'll just show a message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600">
              Necesitas iniciar sesión para acceder a esta página.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}