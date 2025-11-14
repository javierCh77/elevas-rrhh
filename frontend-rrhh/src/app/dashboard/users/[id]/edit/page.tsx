'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User as UserIcon,
  Shield,
  Building,
  Save,
  Key,
  Mail,
  Phone,
  Briefcase,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useSingleUser } from '@/hooks/use-users'
import { DEPARTMENTS, type UserFormData, type User } from '@/lib/types'
import { mapFormDataToUpdateDTO } from '@/lib/users-api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface EditUserForm {
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  position: string
  phone: string
  status: string
  changePassword: boolean
  newPassword: string
  confirmPassword: string
}



export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [originalUser, setOriginalUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<EditUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    position: '',
    phone: '',
    status: '',
    changePassword: false,
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof EditUserForm, string>>>({})

  const {
    user: foundUser,
    isLoading: userLoading,
    error,
    updateUser
  } = useSingleUser(params.id as string)

  useEffect(() => {
    if (foundUser) {
      setOriginalUser(foundUser)
      setFormData({
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        role: foundUser.role,
        department: foundUser.department || '',
        position: foundUser.position || '',
        phone: foundUser.phone || '',
        status: foundUser.status,
        changePassword: false,
        newPassword: '',
        confirmPassword: ''
      })
      setIsLoading(false)
    } else if (error) {
      toast.error('Usuario no encontrado')
      router.push('/dashboard/users')
      setIsLoading(false)
    }
  }, [foundUser, error, router])

  useEffect(() => {
    if (userLoading) {
      setIsLoading(true)
    }
  }, [userLoading])

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditUserForm, string>> = {}

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido'
    }

    if (!formData.department.trim()) {
      newErrors.department = 'El departamento es requerido'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'La posición es requerida'
    }

    // Password validation only if changing password
    if (formData.changePassword) {
      if (!formData.newPassword) {
        newErrors.newPassword = 'La nueva contraseña es requerida'
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la nueva contraseña'
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const updateData = mapFormDataToUpdateDTO(formData as unknown as UserFormData)
      await updateUser(updateData)

      toast.success('Usuario actualizado exitosamente', {
        description: `Los datos de ${formData.firstName} ${formData.lastName} han sido actualizados`,
        duration: 4000
      })

      router.push(`/dashboard/users/${params.id}`)
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar usuario', {
        description: 'Ocurrió un error inesperado. Intenta nuevamente.',
        duration: 4000
      })
    } finally {
      setIsSaving(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({
      ...prev,
      newPassword: password,
      confirmPassword: password
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl animate-pulse" style={{
            background: 'linear-gradient(135deg, rgba(207, 175, 110, 0.3) 0%, rgba(207, 175, 110, 0.1) 100%)'
          }}></div>
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    )
  }

  if (!originalUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 mb-4" style={{color: '#cfaf6e'}} />
          <h3 className="text-lg font-medium mb-2" style={{color: '#1a1a1a'}}>Usuario no encontrado</h3>
          <p style={{color: '#666666'}} className="mb-4">El usuario que buscas no existe o ha sido eliminado.</p>
          <Link href="/dashboard/users">
            <Button
              style={{
                backgroundColor: '#cfaf6e',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#a37d43'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#cfaf6e'
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a usuarios
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <Link href={`/dashboard/users/${params.id}`}>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 sm:w-11 sm:h-11 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                style={{
                  borderColor: 'rgba(207, 175, 110, 0.3)',
                  color: '#cfaf6e'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cfaf6e'
                  e.currentTarget.style.backgroundColor = 'rgba(207, 175, 110, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight truncate" style={{color: '#1a1a1a'}}>
                Editar Usuario
              </h1>
              <p className="text-base sm:text-lg mt-1 sm:mt-2 text-gray-600 truncate">
                Modifica los datos de {originalUser.firstName} {originalUser.lastName}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Personal Information Card - Mobile First */}
          <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm" style={{
            background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(207, 175, 110, 0.2)',
            borderRadius: '12px'
          }}>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl" style={{color: '#1a1a1a'}}>
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{color: '#cfaf6e'}} />
                <span className="truncate">Información Personal</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base" style={{color: '#666666'}}>
                Datos básicos del usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <UserIcon className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Nombre *</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={cn(
                      "h-12 sm:h-11 text-base sm:text-sm transition-all duration-200 touch-manipulation",
                      errors.firstName ? 'border-red-500' : ''
                    )}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.firstName ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '8px'
                    }}
                    onFocus={(e) => {
                      if (!errors.firstName) {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.firstName) {
                        e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                        e.target.style.boxShadow = 'none'
                      }
                    }}
                    placeholder="Ingresa el nombre"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <UserIcon className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Apellido *</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={cn(
                      "h-12 sm:h-11 text-base sm:text-sm transition-all duration-200 touch-manipulation",
                      errors.lastName ? 'border-red-500' : ''
                    )}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.lastName ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '8px'
                    }}
                    onFocus={(e) => {
                      if (!errors.lastName) {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.lastName) {
                        e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                        e.target.style.boxShadow = 'none'
                      }
                    }}
                    placeholder="Ingresa el apellido"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <Mail className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Email *</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(
                      "h-12 sm:h-11 text-base sm:text-sm transition-all duration-200 touch-manipulation",
                      errors.email ? 'border-red-500' : ''
                    )}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.email ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '8px'
                    }}
                    onFocus={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                        e.target.style.boxShadow = 'none'
                      }
                    }}
                    placeholder="usuario@empresa.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <Phone className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Teléfono</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-12 sm:h-11 text-base sm:text-sm transition-all duration-200 touch-manipulation"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '8px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#cfaf6e'
                      e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="Ej: +1234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Information Card - Mobile First */}
          <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm" style={{
            background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(207, 175, 110, 0.2)',
            borderRadius: '12px'
          }}>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl" style={{color: '#1a1a1a'}}>
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{color: '#cfaf6e'}} />
                <span className="truncate">Información de Acceso</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base" style={{color: '#666666'}}>
                Configuración de acceso y seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <Shield className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Rol *</span>
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className={cn(
                      "h-12 sm:h-11 text-base sm:text-sm touch-manipulation",
                      errors.role ? 'border-red-500' : ''
                    )} style={{ borderRadius: '8px' }}>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin" className="text-base sm:text-sm py-3 sm:py-2">Administrador</SelectItem>
                      <SelectItem value="hr" className="text-base sm:text-sm py-3 sm:py-2">Recursos Humanos</SelectItem>
                      <SelectItem value="manager" className="text-base sm:text-sm py-3 sm:py-2">Gerente</SelectItem>
                      <SelectItem value="employee" className="text-base sm:text-sm py-3 sm:py-2">Empleado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {errors.role}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <Users className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Estado</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-12 sm:h-11 text-base sm:text-sm touch-manipulation" style={{ borderRadius: '8px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-base sm:text-sm py-3 sm:py-2">Activo</SelectItem>
                      <SelectItem value="inactive" className="text-base sm:text-sm py-3 sm:py-2">Inactivo</SelectItem>
                      <SelectItem value="suspended" className="text-base sm:text-sm py-3 sm:py-2">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Change Password Section - Mobile First */}
              <div className="space-y-4 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="changePassword"
                    checked={formData.changePassword}
                    onCheckedChange={(checked) => handleInputChange('changePassword', checked as boolean)}
                    className="w-5 h-5 touch-manipulation"
                  />
                  <Label htmlFor="changePassword" className="text-sm sm:text-base font-medium flex items-center cursor-pointer" style={{color: '#1a1a1a'}}>
                    <Key className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Cambiar contraseña</span>
                  </Label>
                </div>

                {formData.changePassword && (
                  <div className="space-y-4 p-4 sm:p-6 rounded-lg" style={{backgroundColor: 'rgba(207, 175, 110, 0.05)'}}>
                    <div className="space-y-3">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium" style={{color: '#1a1a1a'}}>
                          Nueva Contraseña *
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generatePassword}
                          className="w-full sm:w-auto h-9 sm:h-8 text-sm touch-manipulation"
                          style={{
                            borderColor: 'rgba(207, 175, 110, 0.3)',
                            color: '#cfaf6e'
                          }}
                        >
                          Generar
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          className={cn(
                            "h-12 sm:h-11 pr-12 text-base sm:text-sm transition-all duration-200 touch-manipulation",
                            errors.newPassword ? 'border-red-500' : ''
                          )}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderColor: errors.newPassword ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                            borderRadius: '8px'
                          }}
                          placeholder="Mínimo 8 caracteres"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 touch-manipulation"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium" style={{color: '#1a1a1a'}}>
                        Confirmar Nueva Contraseña *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={cn(
                            "h-12 sm:h-11 pr-12 text-base sm:text-sm transition-all duration-200 touch-manipulation",
                            errors.confirmPassword ? 'border-red-500' : ''
                          )}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                            borderRadius: '8px'
                          }}
                          placeholder="Confirma la nueva contraseña"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 touch-manipulation"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organizational Information Card - Mobile First */}
          <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm" style={{
            background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(207, 175, 110, 0.2)',
            borderRadius: '12px'
          }}>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl" style={{color: '#1a1a1a'}}>
                <Building className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{color: '#cfaf6e'}} />
                <span className="truncate">Información Organizacional</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base" style={{color: '#666666'}}>
                Departamento y posición del usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <Building className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Departamento *</span>
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className={cn(
                      "h-12 sm:h-11 text-base sm:text-sm touch-manipulation",
                      errors.department ? 'border-red-500' : ''
                    )} style={{ borderRadius: '8px' }}>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept} className="text-base sm:text-sm py-3 sm:py-2">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {errors.department}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm sm:text-base font-medium flex items-center" style={{color: '#1a1a1a'}}>
                    <Briefcase className="inline h-4 w-4 mr-2 flex-shrink-0" style={{color: '#cfaf6e'}} />
                    <span>Posición *</span>
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={cn(
                      "h-12 sm:h-11 text-base sm:text-sm transition-all duration-200 touch-manipulation",
                      errors.position ? 'border-red-500' : ''
                    )}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.position ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '8px'
                    }}
                    onFocus={(e) => {
                      if (!errors.position) {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.position) {
                        e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                        e.target.style.boxShadow = 'none'
                      }
                    }}
                    placeholder="Ej: Developer, Manager, Analyst"
                  />
                  {errors.position && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {errors.position}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Mobile First */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200">
            <Link href={`/dashboard/users/${params.id}`} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-12 sm:h-11 text-base sm:text-sm transition-all duration-300 touch-manipulation active:scale-95"
                style={{
                  borderColor: 'rgba(207, 175, 110, 0.3)',
                  color: '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cfaf6e'
                  e.currentTarget.style.backgroundColor = 'rgba(207, 175, 110, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto h-12 sm:h-11 text-base sm:text-sm transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-md touch-manipulation active:scale-95"
              style={{
                backgroundColor: '#cfaf6e',
                color: 'white',
                padding: '0 24px sm:0 32px'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#a37d43'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(207, 175, 110, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#cfaf6e'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(207, 175, 110, 0.2)'
                }
              }}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}