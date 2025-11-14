import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

interface UseAutoLogoutOptions {
  timeoutInMinutes?: number // Default: 15 minutes
  warningTimeInMinutes?: number // Default: 2 minutes before logout
  onWarning?: () => void
  onLogout?: () => void
}

export function useAutoLogout({
  timeoutInMinutes = 15,
  warningTimeInMinutes = 2,
  onWarning,
  onLogout
}: UseAutoLogoutOptions = {}) {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const warningTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastActivityRef = useRef<number>(Date.now())

  const timeoutInMs = timeoutInMinutes * 60 * 1000
  const warningTimeInMs = warningTimeInMinutes * 60 * 1000

  const handleLogout = useCallback(async () => {
    if (onLogout) {
      onLogout()
    }

    await logout()
    router.push('/')
  }, [logout, router, onLogout])

  const handleWarning = useCallback(() => {
    if (onWarning) {
      onWarning()
    }
  }, [onWarning])

  const resetTimeout = useCallback(() => {
    if (!isAuthenticated) return

    lastActivityRef.current = Date.now()

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    // Set warning timeout (warning time before logout)
    warningTimeoutRef.current = setTimeout(() => {
      handleWarning()
    }, timeoutInMs - warningTimeInMs)

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, timeoutInMs)
  }, [isAuthenticated, timeoutInMs, warningTimeInMs, handleWarning, handleLogout])

  const extendSession = useCallback(() => {
    resetTimeout()
  }, [resetTimeout])

  const getRemainingTime = useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastActivityRef.current
    const remaining = Math.max(0, timeoutInMs - elapsed)
    return Math.ceil(remaining / 1000) // Return in seconds
  }, [timeoutInMs])

  const getFormattedRemainingTime = useCallback(() => {
    const seconds = getRemainingTime()
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [getRemainingTime])

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timeouts if user is not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      return
    }

    // Activities that reset the timeout
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Throttle the reset function to avoid too many calls
    let throttleTimer: NodeJS.Timeout
    const throttledReset = () => {
      if (throttleTimer) return

      throttleTimer = setTimeout(() => {
        resetTimeout()
        clearTimeout(throttleTimer)
      }, 1000) // Throttle to once per second
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledReset, true)
    })

    // Initial timeout setup
    resetTimeout()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledReset, true)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [isAuthenticated, resetTimeout])

  return {
    extendSession,
    getRemainingTime,
    getFormattedRemainingTime,
    timeoutInMinutes,
    warningTimeInMinutes
  }
}