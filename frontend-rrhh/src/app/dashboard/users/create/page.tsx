'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { UserPlus, Eye, EyeOff, Mail, User, Phone, Building, Lock, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useUsers } from '@/hooks/use-users'
import { DEPARTMENTS, type UserFormData, type UserRole, type UserStatus } from '@/lib/types'
import { mapFormDataToCreateDTO } from '@/lib/users-api'

interface CreateUserForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: string
  department: string
  position: string
  phone: string
  status: string
  sendWelcomeEmail: boolean
}


export default function CreateUserPage() {
  const router = useRouter()
  const { createUser } = useUsers()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    position: '',
    phone: '',
    status: 'active',
    sendWelcomeEmail: true
  })

  const [errors, setErrors] = useState<Partial<CreateUserForm>>({})

  const handleInputChange = (field: keyof CreateUserForm, value: string | boolean) => {
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
    const newErrors: Partial<CreateUserForm> = {}

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

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Map CreateUserForm to UserFormData & { password: string }
      const userFormData: UserFormData & { password: string } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role as UserRole | '',
        department: formData.department,
        position: formData.position,
        phone: formData.phone,
        status: formData.status as UserStatus,
        changePassword: false,
        newPassword: '',
        confirmPassword: '',
        password: formData.password
      }
      const createData = mapFormDataToCreateDTO(userFormData)
      const newUser = await createUser(createData)

      if (newUser) {
        router.push('/dashboard/users')
      }
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsLoading(false)
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
      password,
      confirmPassword: password
    }))
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
            Crear Nuevo Usuario
          </h1>
          <p className="text-sm sm:text-base text-amber-700/80">
            Completa los datos para crear un nuevo usuario en el sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <Card className="transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Información Personal
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Datos básicos del usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`h-11 transition-all duration-200 bg-white/90 ${
                        errors.firstName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : 'border-amber-200/50 focus:border-amber-400 focus:ring-amber-200'
                      }`}
                      placeholder="Nombre"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`h-11 transition-all duration-200 bg-white/90 ${
                        errors.lastName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : 'border-amber-200/50 focus:border-amber-400 focus:ring-amber-200'
                      }`}
                      placeholder="Apellido"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 h-11 transition-all duration-200 bg-white/90 ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : 'border-amber-200/50 focus:border-amber-400 focus:ring-amber-200'
                      }`}
                      placeholder="usuario@empresa.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 h-11 transition-all duration-200"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(207, 175, 110, 0.3)',
                        borderRadius: '12px'
                      }}
                      placeholder="+1234567890"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#cfaf6e'
                        e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Acceso */}
            <Card className="transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  Información de Acceso
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Credenciales y configuración de acceso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                      className="text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
                    >
                      Generar
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`h-11 pr-10 transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: errors.password ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                        borderRadius: '12px'
                      }}
                      placeholder="Mínimo 8 caracteres"
                      onFocus={(e) => {
                        if (!errors.password) {
                          e.target.style.borderColor = '#cfaf6e'
                          e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.password) {
                          e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                          e.target.style.boxShadow = 'none'
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`h-11 pr-10 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                        borderRadius: '12px'
                      }}
                      placeholder="Confirma la contraseña"
                      onFocus={(e) => {
                        if (!errors.confirmPassword) {
                          e.target.style.borderColor = '#cfaf6e'
                          e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.confirmPassword) {
                          e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                          e.target.style.boxShadow = 'none'
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
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
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">Rol *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className={`h-11 ${errors.role ? 'border-red-500' : ''}`} style={{
                      borderRadius: '12px',
                      borderColor: errors.role ? '#ef4444' : 'rgba(207, 175, 110, 0.3)'
                    }}>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="hr">Recursos Humanos</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="employee">Empleado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-11" style={{ borderRadius: '12px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Información Organizacional */}
            <Card className="transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg">
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  Información Organizacional
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Departamento y posición del usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">Departamento *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className={`h-11 ${errors.department ? 'border-red-500' : ''}`} style={{
                      borderRadius: '12px',
                      borderColor: errors.department ? '#ef4444' : 'rgba(207, 175, 110, 0.3)'
                    }}>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-gray-700">Posición *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`h-11 transition-all duration-200 ${errors.position ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.position ? '#ef4444' : 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '12px'
                    }}
                    placeholder="Ej: Developer, Manager, Analyst"
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
                  />
                  {errors.position && (
                    <p className="text-sm text-red-600">{errors.position}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuraciones Adicionales */}
            <Card className="transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  Configuraciones Adicionales
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Opciones de configuración y notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onCheckedChange={(checked) => handleInputChange('sendWelcomeEmail', checked as boolean)}
                  />
                  <Label
                    htmlFor="sendWelcomeEmail"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    style={{color: '#1a1a1a'}}
                  >
                    Enviar email de bienvenida con credenciales
                  </Label>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <p className="text-sm" style={{color: '#1e40af'}}>
                    <strong>Nota:</strong> El usuario recibirá un email con sus credenciales de acceso y un enlace para establecer una nueva contraseña en su primer inicio de sesión.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-amber-100/50">
            <Button type="button" variant="outline" asChild className="text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300">
              <Link href="/dashboard/users">
                Cancelar
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando Usuario...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}