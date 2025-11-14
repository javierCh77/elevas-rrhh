'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Debug: log all auth changes
  useEffect(() => {
    console.log('RouteGuard: Auth state changed', { isAuthenticated, isLoading, user: !!user, pathname })
  }, [isAuthenticated, isLoading, user, pathname])

  useEffect(() => {
    console.log('RouteGuard useEffect triggered', { isLoading, isAuthenticated, pathname })

    if (isLoading) {
      console.log('RouteGuard: Still loading, skipping...')
      return
    }

    console.log('RouteGuard check:', { isAuthenticated, isLoading, pathname })

    // Define public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password']

    // Check if current route is public
    const isPublicRoute = publicRoutes.includes(pathname)

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      console.log('RouteGuard: Redirecting unauthenticated user to /')
      router.replace('/')
      return
    }

    // If user is authenticated and trying to access login/register, redirect to dashboard
    if (isAuthenticated && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
      console.log('RouteGuard: Redirecting authenticated user to /dashboard')
      router.replace('/dashboard')
      return
    }

    console.log('RouteGuard: No redirect needed')
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{
        background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)'
      }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-transparent animate-spin" style={{
            borderTop: '4px solid #cfaf6e',
            borderRight: '4px solid #cfaf6e'
          }}></div>
          <p className="text-sm" style={{ color: '#a37d43' }}>
            Verificando autenticación...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}