'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Token de restablecimiento no válido')
      setIsValidToken(false)
      return
    }

    setToken(tokenParam)
    // Skip validation for now, just set as valid
    setIsValidToken(true)
  }, [searchParams])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número'
    }
    return null
  }

  const getPasswordValidationChecks = (password: string) => {
    return {
      length: password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password)
    }
  }

  const getPasswordStrength = (password: string) => {
    const checks = getPasswordValidationChecks(password)
    const validCount = Object.values(checks).filter(Boolean).length

    if (validCount === 0) return { strength: 0, label: '', color: '' }
    if (validCount === 1) return { strength: 25, label: 'Muy débil', color: '#ef4444' }
    if (validCount === 2) return { strength: 50, label: 'Débil', color: '#f97316' }
    if (validCount === 3) return { strength: 75, label: 'Buena', color: '#eab308' }
    if (validCount === 4) return { strength: 100, label: 'Excelente', color: '#22c55e' }
    return { strength: 0, label: '', color: '' }
  }

  const passwordChecks = getPasswordValidationChecks(password)
  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Frontend validation
    if (!password.trim()) {
      setError('La contraseña es requerida')
      return
    }

    if (!confirmPassword.trim()) {
      setError('La confirmación de contraseña es requerida')
      return
    }

    const passwordValidation = validatePassword(password)
    if (passwordValidation) {
      setError(passwordValidation)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400) {
          setError('El enlace de restablecimiento ha expirado o no es válido')
          toast.error('Enlace expirado', {
            description: 'Solicita un nuevo enlace de restablecimiento',
          })
        } else if (response.status === 429) {
          setError('Demasiados intentos. Intenta nuevamente en unos minutos')
          toast.error('Límite de intentos excedido', {
            description: 'Has realizado muchos intentos recientes',
          })
        } else {
          setError(data.message || 'Error al restablecer la contraseña')
          toast.error('Error en la solicitud', {
            description: data.message || 'Ocurrió un error inesperado',
          })
        }
        return
      }

      // Success
      setIsSuccess(true)
      toast.success('Contraseña restablecida exitosamente', {
        description: 'Ya puedes iniciar sesión con tu nueva contraseña',
        duration: 5000,
      })

    } catch (error) {
      console.error('Reset password error:', error)
      setError('Error de conexión. Verifica tu internet e intenta nuevamente')
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.push('/')
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)'
      }}>
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="ml-2">Validando enlace...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)'
      }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
            </div>
            <CardTitle style={{ color: '#a37d43' }}>Enlace No Válido</CardTitle>
            <CardDescription>
              El enlace de restablecimiento ha expirado o no es válido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Link href="/forgot-password" className="block">
                <Button className="w-full" style={{
                  backgroundColor: '#cfaf6e',
                  borderColor: '#cfaf6e'
                }}>
                  Solicitar Nuevo Enlace
                </Button>
              </Link>

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

  if (isSuccess) {
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
            <CardTitle style={{ color: '#a37d43' }}>Contraseña Restablecida</CardTitle>
            <CardDescription>
              Tu contraseña ha sido restablecida exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ya puedes iniciar sesión con tu nueva contraseña
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleGoToLogin}
              className="w-full"
              style={{
                backgroundColor: '#cfaf6e',
                borderColor: '#cfaf6e'
              }}
            >
              Ir a Iniciar Sesión
            </Button>
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
            <Lock className="w-8 h-8" style={{ color: '#cfaf6e' }} />
          </div>
          <CardTitle style={{ color: '#a37d43' }}>Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="transition-all duration-200 pr-10"
                  style={{
                    borderColor: password.length === 0 ? 'rgba(207, 175, 110, 0.3)' :
                                passwordStrength.strength === 100 ? '#22c55e' :
                                passwordStrength.strength >= 75 ? '#eab308' :
                                passwordStrength.strength >= 50 ? '#f97316' :
                                passwordStrength.strength >= 25 ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                    boxShadow: password.length > 0 ? `0 0 0 1px ${passwordStrength.color}20` : 'none'
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" style={{ color: '#cfaf6e' }} />
                  ) : (
                    <Eye className="h-4 w-4" style={{ color: '#cfaf6e' }} />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="transition-all duration-200 pr-10"
                  style={{
                    borderColor: confirmPassword.length === 0 ? 'rgba(207, 175, 110, 0.3)' :
                                passwordsMatch ? '#22c55e' : '#ef4444',
                    boxShadow: confirmPassword.length > 0 ? `0 0 0 1px ${passwordsMatch ? '#22c55e' : '#ef4444'}20` : 'none'
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" style={{ color: '#cfaf6e' }} />
                  ) : (
                    <Eye className="h-4 w-4" style={{ color: '#cfaf6e' }} />
                  )}
                </Button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fortaleza de la contraseña</span>
                    <span style={{ color: passwordStrength.color, fontWeight: '500' }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password Requirements with Visual Indicators */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Requisitos de contraseña:</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2">
                  {passwordChecks.length ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${passwordChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                    Al menos 8 caracteres
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordChecks.lowercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    Una letra minúscula (a-z)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordChecks.uppercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    Una letra mayúscula (A-Z)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordChecks.number ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${passwordChecks.number ? 'text-green-600' : 'text-gray-500'}`}>
                    Un número (0-9)
                  </span>
                </div>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <div className="flex items-center space-x-2">
                {passwordsMatch ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Las contraseñas coinciden</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">Las contraseñas no coinciden</span>
                  </>
                )}
              </div>
            )}

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
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Restableciendo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Restablecer Contraseña
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)'
      }}>
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="ml-2">Cargando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}