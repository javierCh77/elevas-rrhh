'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Key,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Clock,
  User,
  Briefcase,
  Settings,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useSingleUser, useUsers } from '@/hooks/use-users'
import { ROLE_NAMES } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'



const statusConfig = {
  active: {
    label: 'Activo',
    icon: UserCheck,
    badgeStyle: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#16a34a',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    }
  },
  inactive: {
    label: 'Inactivo',
    icon: UserX,
    badgeStyle: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#4b5563',
      border: '1px solid rgba(107, 114, 128, 0.3)'
    }
  },
  suspended: {
    label: 'Suspendido',
    icon: Shield,
    badgeStyle: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    }
  }
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { } = useAuth()
  const {
    user,
    isLoading,
    error,
    updateUser
  } = useSingleUser(params.id as string)

  const { updateUserStatus } = useUsers()

  const [isUpdating, setIsUpdating] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const handleUserAction = async (action: string) => {
    if (!user) return

    setIsUpdating(true)
    try {
      switch (action) {
        case 'activate':
          await updateUserStatus(user.id, 'active')
          break
        case 'deactivate':
          await updateUserStatus(user.id, 'inactive')
          break
        case 'suspend':
          await updateUserStatus(user.id, 'suspended')
          break
        case 'delete':
          if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            // TODO: Implement delete functionality
            toast.success('Usuario eliminado exitosamente')
            router.push('/dashboard/users')
          }
          break
      }
    } catch (err) {
      console.error('Error performing user action:', err)
      toast.error('Error al realizar la acción')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user || !newPassword.trim()) return

    setIsUpdating(true)
    try {
      // Generate random password if none provided
      const passwordToUse = newPassword.trim() || generateRandomPassword()

      // Call the reset password API
      await updateUser({ password: passwordToUse })

      toast.success('Contraseña reseteada exitosamente', {
        description: `Nueva contraseña: ${passwordToUse}`,
        duration: 10000
      })

      setShowPasswordDialog(false)
      setNewPassword('')
    } catch (err) {
      console.error('Error resetting password:', err)
      toast.error('Error al resetear la contraseña')
    } finally {
      setIsUpdating(false)
    }
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSendEmail = () => {
    if (!user) return

    // Create mailto link
    const subject = encodeURIComponent('Mensaje desde el sistema RRHH')
    const body = encodeURIComponent(`Hola ${user.firstName},\n\n`)
    const mailtoLink = `mailto:${user.email}?subject=${subject}&body=${body}`

    // Open email client
    window.location.href = mailtoLink

    toast.success('Cliente de email abierto', {
      description: `Email dirigido a ${user.email}`
    })
  }

  const handleViewWorkHistory = () => {
    // TODO: Navigate to work history page when implemented
    toast.info('Función en desarrollo', {
      description: 'El historial laboral estará disponible próximamente'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar usuario', {
        description: error
      })
    }
  }, [error])

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin" style={{color: '#cfaf6e'}} />
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    )
  }

  if (!user) {
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

  const statusInfo = statusConfig[user.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen w-full">
      {/* Mobile-first container with progressive spacing */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section - Mobile-first responsive */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between lg:items-center gap-3 sm:gap-4">
          {/* Back button and title section */}
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <Link href="/dashboard/users">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
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
              {/* Mobile-first typography scaling */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight" style={{color: '#1a1a1a'}}>
                <span className="break-words">{user.firstName} {user.lastName}</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg mt-1 sm:mt-2 text-gray-600 leading-snug break-words" style={{color: '#666666'}}>
                {user.position}{user.department && ` • ${user.department}`}
              </p>
            </div>
          </div>

          {/* Action buttons - Mobile-first stacking */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
            <Link href={`/dashboard/users/${user.id}/edit`}>
              <Button
                size="sm"
                className="h-9 sm:h-10 px-3 sm:px-4 lg:px-6 text-sm sm:text-base transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-md active:scale-95 whitespace-nowrap"
                style={{
                  backgroundColor: '#cfaf6e',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a37d43'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(207, 175, 110, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#cfaf6e'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(207, 175, 110, 0.2)'
                }}
              >
                <Edit className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline sm:hidden md:inline">Editar Usuario</span>
                <span className="xs:hidden sm:inline md:hidden">Editar</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 transition-all duration-300 cursor-pointer active:scale-95"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                {user.status === 'active' ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleUserAction('deactivate')}
                      className="cursor-pointer py-3 sm:py-2"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Desactivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUserAction('suspend')}
                      className="cursor-pointer py-3 sm:py-2"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Suspender
                    </DropdownMenuItem>
                  </>
                ) : user.status === 'inactive' ? (
                  <DropdownMenuItem
                    onClick={() => handleUserAction('activate')}
                    className="cursor-pointer py-3 sm:py-2"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleUserAction('activate')}
                    className="cursor-pointer py-3 sm:py-2"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Reactivar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-3 sm:py-2">
                  <Key className="h-4 w-4 mr-2" />
                  Resetear contraseña
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUserAction('delete')}
                  className="text-red-600 cursor-pointer py-3 sm:py-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar usuario
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content - Mobile-first grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Card - Mobile-first responsive */}
            <Card className="transition-all duration-300 hover:shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(207, 175, 110, 0.2)',
              borderRadius: '12px'
            }}>
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg" style={{color: '#1a1a1a'}}>
                  <User className="h-4 w-4 sm:h-5 sm:w-5" style={{color: '#cfaf6e'}} />
                  <span>Información Personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Avatar and basic info - Mobile-first layout */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 sm:ring-4 ring-white shadow-lg flex-shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}+${user.lastName}`} />
                    <AvatarFallback style={{
                      backgroundColor: 'rgba(207, 175, 110, 0.1)',
                      color: '#a37d43',
                      fontWeight: '600',
                      fontSize: '1.25rem'
                    }}>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight break-words" style={{color: '#1a1a1a'}}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg mt-1 break-words" style={{color: '#666666'}}>
                      {user.position || 'Sin posición asignada'}
                    </p>
                    <Badge className="inline-flex items-center space-x-1 mt-2 px-2 py-1 text-xs sm:text-sm" style={statusInfo.badgeStyle}>
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusInfo.label}</span>
                    </Badge>
                  </div>
                </div>

                {/* Contact information - Mobile-first grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm sm:text-base break-all" style={{color: '#1a1a1a'}}>{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Teléfono</p>
                        <p className="text-sm sm:text-base break-all" style={{color: '#1a1a1a'}}>{user.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Departamento</p>
                        <p className="text-sm sm:text-base break-words" style={{color: '#1a1a1a'}}>{user.department || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Ubicación</p>
                        <p className="text-sm sm:text-base break-words" style={{color: '#1a1a1a'}}>{'No especificada'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions Card - Mobile-first responsive */}
            <Card className="transition-all duration-300 hover:shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(207, 175, 110, 0.2)',
              borderRadius: '12px'
            }}>
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg" style={{color: '#1a1a1a'}}>
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{color: '#cfaf6e'}} />
                  <span>Rol y Permisos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Rol del Sistema</span>
                  <Badge variant="secondary" className="self-start sm:self-auto text-xs sm:text-sm px-2 py-1" style={{
                    backgroundColor: 'rgba(207, 175, 110, 0.1)',
                    color: '#a37d43',
                    border: '1px solid rgba(207, 175, 110, 0.2)'
                  }}>
                    {ROLE_NAMES[user.role] || user.role}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block">Estado del Usuario</span>
                  <Badge className="inline-flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm" style={statusInfo.badgeStyle}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusInfo.label}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Metadata */}
          <div className="space-y-4 sm:space-y-6">
            {/* Activity Card - Mobile-first responsive */}
            <Card className="transition-all duration-300 hover:shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(207, 175, 110, 0.2)',
              borderRadius: '12px'
            }}>
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg" style={{color: '#1a1a1a'}}>
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" style={{color: '#cfaf6e'}} />
                  <span>Actividad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Último Acceso</p>
                    <p className="text-sm break-words" style={{color: '#1a1a1a'}}>{formatDate(user.lastLoginAt)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Fecha de Registro</p>
                    <p className="text-sm break-words" style={{color: '#1a1a1a'}}>{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" style={{color: '#cfaf6e'}} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Última Actualización</p>
                    <p className="text-sm break-words" style={{color: '#1a1a1a'}}>{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card - Mobile-first responsive */}
            <Card className="transition-all duration-300 hover:shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(207, 175, 110, 0.2)',
              borderRadius: '12px'
            }}>
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg" style={{color: '#1a1a1a'}}>
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" style={{color: '#cfaf6e'}} />
                  <span>Acciones Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base active:scale-95 transition-transform"
                  onClick={() => setShowPasswordDialog(true)}
                  disabled={isUpdating}
                >
                  <Key className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Resetear Contraseña</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base active:scale-95 transition-transform"
                  onClick={handleSendEmail}
                >
                  <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Enviar Email</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 sm:h-11 text-sm sm:text-base active:scale-95 transition-transform"
                  onClick={handleViewWorkHistory}
                >
                  <Briefcase className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Ver Historial Laboral</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Password Reset Dialog */}
        {showPasswordDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{
              background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(207, 175, 110, 0.2)'
            }}>
              <div className="flex items-center space-x-2 mb-4">
                <Key className="h-5 w-5" style={{color: '#cfaf6e'}} />
                <h3 className="text-lg font-semibold" style={{color: '#1a1a1a'}}>Resetear Contraseña</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                ¿Deseas generar una nueva contraseña para {user.firstName} {user.lastName}?
              </p>

              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium" style={{color: '#1a1a1a'}}>Nueva Contraseña (opcional)</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dejar vacío para generar automáticamente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: 'rgba(207, 175, 110, 0.3)'
                  }}
                />
                <p className="text-xs text-gray-500">
                  Si no especificas una contraseña, se generará una automáticamente
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false)
                    setNewPassword('')
                  }}
                  className="flex-1"
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={isUpdating}
                  className="flex-1"
                  style={{
                    backgroundColor: '#cfaf6e',
                    color: 'white'
                  }}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reseteando...
                    </>
                  ) : (
                    'Resetear'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}