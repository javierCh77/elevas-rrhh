'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Frontend validation
    if (!email.trim()) {
      setError('El email es requerido')
      return
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError('No encontramos una cuenta asociada a este email')
          toast.error('Email no encontrado', {
            description: 'No existe una cuenta registrada con este email',
          })
        } else if (response.status === 429) {
          setError('Demasiados intentos. Intenta nuevamente en unos minutos')
          toast.error('Límite de intentos excedido', {
            description: 'Has realizado muchos intentos recientes',
          })
        } else {
          setError(data.message || 'Error al procesar la solicitud')
          toast.error('Error en la solicitud', {
            description: data.message || 'Ocurrió un error inesperado',
          })
        }
        return
      }

      // Success
      setIsEmailSent(true)
      toast.success('Email enviado exitosamente', {
        description: 'Revisa tu bandeja de entrada para continuar',
        duration: 5000,
      })

    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Error de conexión. Verifica tu internet e intenta nuevamente')
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsEmailSent(false)
    setEmail('')
    setError('')
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)'
      }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
              border: '1px solid rgba(207, 175, 110, 0.3)',
              boxShadow: '0 4px 16px rgba(207, 175, 110, 0.2)'
            }}>
              <CheckCircle className="w-8 h-8" style={{ color: '#2dd4bf' }} />
            </div>
            <CardTitle style={{ color: '#a37d43' }}>Email Enviado</CardTitle>
            <CardDescription>
              Hemos enviado las instrucciones de recuperación a <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Revisa tu bandeja de entrada y carpeta de spam. El enlace expirará en 1 hora.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleTryAgain}
                variant="outline"
                className="w-full"
              >
                Intentar con otro email
              </Button>

              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)'
    }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
            border: '1px solid rgba(207, 175, 110, 0.3)',
            boxShadow: '0 4px 16px rgba(207, 175, 110, 0.2)'
          }}>
            <Mail className="w-8 h-8" style={{ color: '#cfaf6e' }} />
          </div>
          <CardTitle style={{ color: '#a37d43' }}>Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="transition-all duration-200"
                style={{
                  borderColor: error ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = '#cfaf6e'
                    e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }
                }}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full transition-all duration-300"
              disabled={isLoading}
              style={{
                backgroundColor: '#cfaf6e',
                borderColor: '#cfaf6e'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#a37d43'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#cfaf6e'
                }
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Instrucciones
                </>
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm hover:underline transition-colors duration-200"
                style={{ color: '#a37d43' }}
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}