import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle } from 'lucide-react'

interface LogoutWarningModalProps {
  isOpen: boolean
  onExtendSession: () => void
  onLogout: () => void
  remainingTimeInSeconds: number
}

export function LogoutWarningModal({
  isOpen,
  onExtendSession,
  onLogout,
  remainingTimeInSeconds
}: LogoutWarningModalProps) {
  const [timeLeft, setTimeLeft] = useState(remainingTimeInSeconds)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const onLogoutRef = useRef(onLogout)

  // Update ref when onLogout changes
  useEffect(() => {
    onLogoutRef.current = onLogout
  }, [onLogout])

  useEffect(() => {
    setTimeLeft(remainingTimeInSeconds)
  }, [remainingTimeInSeconds])

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          // Call onLogout using setTimeout to avoid calling during render
          setTimeout(() => {
            onLogoutRef.current()
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sesión por Expirar
          </DialogTitle>
          <DialogDescription>
            Tu sesión expirará automáticamente por inactividad en:
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-orange-600">
                minutos restantes
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex-1"
          >
            Cerrar Sesión
          </Button>
          <Button
            onClick={onExtendSession}
            className="flex-1"
            style={{
              backgroundColor: '#cfaf6e',
              borderColor: '#cfaf6e'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#a37d43'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#cfaf6e'
            }}
          >
            Extender Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}