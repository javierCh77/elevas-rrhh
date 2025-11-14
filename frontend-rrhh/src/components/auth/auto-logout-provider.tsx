'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useAutoLogout } from '@/hooks/use-auto-logout'
import { LogoutWarningModal } from './logout-warning-modal'
import { toast } from 'sonner'

interface AutoLogoutProviderProps {
  children: React.ReactNode
}

export function AutoLogoutProvider({ children }: AutoLogoutProviderProps) {
  const { isAuthenticated } = useAuth()
  const [showWarning, setShowWarning] = useState(false)

  const {
    extendSession,
    getRemainingTime,
    timeoutInMinutes
  } = useAutoLogout({
    timeoutInMinutes: 15, // 15 minutes of inactivity
    warningTimeInMinutes: 2, // Show warning 2 minutes before logout
    onWarning: () => {
      setShowWarning(true)
      toast.warning('Tu sesión expirará pronto por inactividad', {
        description: 'Haz clic en cualquier lugar para extender tu sesión',
        duration: 5000
      })
    },
    onLogout: () => {
      setShowWarning(false)
      toast.error('Sesión cerrada por inactividad', {
        description: 'Has sido desconectado automáticamente por seguridad',
        duration: 5000
      })
    }
  })

  const handleExtendSession = () => {
    setShowWarning(false)
    extendSession()
    toast.success('Sesión extendida', {
      description: `Tu sesión ha sido extendida por ${timeoutInMinutes} minutos más`,
      duration: 3000
    })
  }

  const handleManualLogout = async () => {
    setShowWarning(false)
    // The logout will be handled by the useAutoLogout hook
  }

  // Only show warning if user is authenticated
  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <LogoutWarningModal
        isOpen={showWarning}
        onExtendSession={handleExtendSession}
        onLogout={handleManualLogout}
        remainingTimeInSeconds={getRemainingTime()}
      />
    </>
  )
}