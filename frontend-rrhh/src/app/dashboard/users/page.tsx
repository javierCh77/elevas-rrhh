'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Key,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useUsers, useUserSearch } from '@/hooks/use-users'
import { ROLE_NAMES, type User, type UserRole, type UserStatus } from '@/lib/types'
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
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
      border: '1px solid rgba(34, 197, 94, 0.2)'
    }
  },
  inactive: {
    label: 'Inactivo',
    icon: UserX,
    badgeStyle: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#4b5563',
      border: '1px solid rgba(107, 114, 128, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
      border: '1px solid rgba(107, 114, 128, 0.2)'
    }
  },
  suspended: {
    label: 'Suspendido',
    icon: Shield,
    badgeStyle: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  }
}


export default function UsersPage() {
  const { } = useAuth()
  const {
    users,
    isLoading,
    error,
    stats,
    updateUserStatus,
    deleteUser,
    refreshUsers
  } = useUsers()

  const {
    searchFilters,
    updateFilters
  } = useUserSearch()

  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const itemsPerPage = 10

  // Filter users based on search and filters
  useEffect(() => {
    const filtered = users.filter(u => {
      const matchesSearch = !searchFilters.searchTerm ||
        u.firstName.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())) ||
        (u.position && u.position.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()))

      const matchesRole = searchFilters.roleFilter === 'all' || u.role === searchFilters.roleFilter
      const matchesStatus = searchFilters.statusFilter === 'all' || u.status === searchFilters.statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredUsers(filtered)
  }, [users, searchFilters])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (searchFilters.currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await updateUserStatus(userId, 'active')
          break
        case 'deactivate':
          await updateUserStatus(userId, 'inactive')
          break
        case 'suspend':
          await updateUserStatus(userId, 'suspended')
          break
        case 'delete':
          if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            await deleteUser(userId)
          }
          break
      }
    } catch (err) {
      console.error('Error performing user action:', err)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Use error handling for display
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar usuarios', {
        description: error
      })
    }
  }, [error])

  // Handle refresh
  const handleRefresh = async () => {
    await refreshUsers()
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
                Gestión de Usuarios
              </h1>
              <p className="text-sm sm:text-base text-amber-700/80 leading-relaxed">
                Administra usuarios del sistema, roles y permisos de manera eficiente
              </p>
            </div>
            {isLoading && (
              <div className="flex-shrink-0">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" style={{color: '#cfaf6e'}} />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
              className="h-10 sm:h-11 transition-all duration-300 touch-manipulation text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
              <span className="sm:hidden">Refrescar</span>
            </Button>
            <Link href="/dashboard/users/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-fit h-10 sm:h-11 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-md touch-manipulation bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Crear Usuario</span>
                <span className="sm:hidden">Crear</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Usuarios</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                  <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Activos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.active || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-slate-500 to-gray-500">
                  <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Inactivos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.inactive || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-rose-500 to-pink-500">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Suspendidos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.suspended || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-violet-500 to-purple-500">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Administradores</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.admins || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Mobile First */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-end">
            <div className="flex-1 lg:max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar usuarios</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
                <Input
                  placeholder="Escribir nombre, email, departamento..."
                  value={searchFilters.searchTerm}
                  onChange={(e) => {
                    updateFilters({ searchTerm: e.target.value })
                  }}
                  className="pl-10 h-11 text-base transition-all duration-200 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 sm:max-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <Select value={searchFilters.roleFilter} onValueChange={(value) => {
                  updateFilters({ roleFilter: value as UserRole | 'all' })
                }}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="hr">Recursos Humanos</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="employee">Empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 sm:max-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <Select value={searchFilters.statusFilter} onValueChange={(value) => {
                  updateFilters({ statusFilter: value as UserStatus | 'all' })
                }}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Users List - Mobile First Design */}
        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="border-b border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
                    <div className="col-span-3">Usuario</div>
                    <div className="col-span-2">Rol & Departamento</div>
                    <div className="col-span-2">Contacto</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-2">Último Acceso</div>
                    <div className="col-span-1 text-right">Acciones</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {paginatedUsers.map((user) => {
                    const statusInfo = statusConfig[user.status as keyof typeof statusConfig]
                    const StatusIcon = statusInfo.icon

                    return (
                      <div
                        key={user.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => window.location.href = `/dashboard/users/${user.id}`}
                      >
                        {/* Usuario */}
                        <div className="col-span-3 flex items-center space-x-3">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}+${user.lastName}`} />
                            <AvatarFallback style={{
                              backgroundColor: 'rgba(207, 175, 110, 0.1)',
                              color: '#a37d43',
                              fontWeight: '600'
                            }}>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.position}</p>
                          </div>
                        </div>

                        {/* Rol & Departamento */}
                        <div className="col-span-2 flex flex-col justify-center space-y-1">
                          <Badge variant="secondary" className="w-fit text-xs" style={{
                            backgroundColor: 'rgba(207, 175, 110, 0.1)',
                            color: '#a37d43',
                            border: '1px solid rgba(207, 175, 110, 0.2)'
                          }}>
                            {ROLE_NAMES[user.role] || user.role}
                          </Badge>
                          <span className="text-xs text-gray-500">{user.department || 'Sin departamento'}</span>
                        </div>

                        {/* Contacto */}
                        <div className="col-span-2 flex flex-col justify-center space-y-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate" title={user.email}>
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-500">{user.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Estado */}
                        <div className="col-span-2 flex items-center">
                          <Badge className="flex items-center space-x-1 text-xs" style={statusInfo.badgeStyle}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusInfo.label}</span>
                          </Badge>
                        </div>

                        {/* Último Acceso */}
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatLastLogin(user.lastLoginAt)}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="col-span-1 flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user.id}`} className="flex items-center w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user.id}/edit`} className="flex items-center w-full">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar usuario
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleUserAction(user.id, 'deactivate')
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Desactivar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleUserAction(user.id, 'suspend')
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Suspender
                                  </DropdownMenuItem>
                                </>
                              ) : user.status === 'inactive' ? (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUserAction(user.id, 'activate')
                                  }}
                                  className="cursor-pointer"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUserAction(user.id, 'activate')
                                  }}
                                  className="cursor-pointer"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Reactivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Resetear contraseña
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUserAction(user.id, 'delete')
                                }}
                                className="text-red-600 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View - Visible only on Mobile & Tablet */}
          <div className="lg:hidden">
            <div className="space-y-3 p-3 sm:p-4">
              {paginatedUsers.map((user) => {
                const statusInfo = statusConfig[user.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo.icon

                return (
                  <Card
                    key={user.id}
                    className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98] touch-manipulation"
                    style={{
                      ...statusInfo.cardStyle,
                      borderRadius: '12px',
                      minHeight: '140px'
                    }}
                    onClick={() => window.location.href = `/dashboard/users/${user.id}`}
                  >
                    <CardContent className="p-4">
                      {/* Header with Avatar, Name and Actions */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-md flex-shrink-0">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}+${user.lastName}`} />
                            <AvatarFallback style={{
                              backgroundColor: 'rgba(207, 175, 110, 0.1)',
                              color: '#a37d43',
                              fontWeight: '600',
                              fontSize: '14px'
                            }}>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 truncate mt-0.5">{user.position}</p>
                            <Badge
                              variant="secondary"
                              className="mt-1.5 text-xs px-2 py-0.5"
                              style={{
                                backgroundColor: 'rgba(207, 175, 110, 0.1)',
                                color: '#a37d43',
                                border: '1px solid rgba(207, 175, 110, 0.2)'
                              }}
                            >
                              {ROLE_NAMES[user.role] || user.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 touch-manipulation"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 touch-manipulation">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user.id}`} className="flex items-center w-full py-3">
                                  <Eye className="h-4 w-4 mr-3" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user.id}/edit`} className="flex items-center w-full py-3">
                                  <Edit className="h-4 w-4 mr-3" />
                                  Editar usuario
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleUserAction(user.id, 'deactivate')
                                    }}
                                    className="cursor-pointer py-3"
                                  >
                                    <UserX className="h-4 w-4 mr-3" />
                                    Desactivar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleUserAction(user.id, 'suspend')
                                    }}
                                    className="cursor-pointer py-3"
                                  >
                                    <Shield className="h-4 w-4 mr-3" />
                                    Suspender
                                  </DropdownMenuItem>
                                </>
                              ) : user.status === 'inactive' ? (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUserAction(user.id, 'activate')
                                  }}
                                  className="cursor-pointer py-3"
                                >
                                  <UserCheck className="h-4 w-4 mr-3" />
                                  Activar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUserAction(user.id, 'activate')
                                  }}
                                  className="cursor-pointer py-3"
                                >
                                  <UserCheck className="h-4 w-4 mr-3" />
                                  Reactivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="py-3"
                              >
                                <Key className="h-4 w-4 mr-3" />
                                Resetear contraseña
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUserAction(user.id, 'delete')
                                }}
                                className="text-red-600 cursor-pointer py-3"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Eliminar usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Info Grid - Mobile Optimized */}
                      <div className="space-y-3">
                        {/* Contact Information */}
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate flex-1" title={user.email}>
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{user.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Department and Status Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              {user.department || 'Sin departamento'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className="flex items-center space-x-1 text-xs px-2 py-1"
                              style={statusInfo.badgeStyle}
                            >
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusInfo.label}</span>
                            </Badge>
                          </div>
                        </div>

                        {/* Last Login */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Último acceso:</span>
                          </div>
                          <span className="font-medium">
                            {formatLastLogin(user.lastLoginAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Pagination - Mobile First */}
        {filteredUsers.length > 0 && totalPages > 1 && (
          <div className="border-t pt-6">
            {/* Mobile Pagination */}
            <div className="lg:hidden">
              <div className="flex flex-col space-y-4">
                <div className="text-center text-sm text-gray-600">
                  Página {searchFilters.currentPage} de {totalPages}
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ currentPage: searchFilters.currentPage - 1 })}
                    disabled={searchFilters.currentPage === 1}
                    className="h-10 px-4 touch-manipulation text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ currentPage: searchFilters.currentPage + 1 })}
                    disabled={searchFilters.currentPage === totalPages}
                    className="h-10 px-4 touch-manipulation text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="text-center text-xs text-gray-500">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} resultados
                </div>
              </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} resultados
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ currentPage: searchFilters.currentPage - 1 })}
                  disabled={searchFilters.currentPage === 1}
                  className="h-9 w-9 p-0 text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= searchFilters.currentPage - 1 && page <= searchFilters.currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={searchFilters.currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilters({ currentPage: page })}
                          className={`h-9 w-9 p-0 ${
                            searchFilters.currentPage === page
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600'
                              : 'text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300'
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    }
                    if (page === searchFilters.currentPage - 2 || page === searchFilters.currentPage + 2) {
                      return <span key={page} className="px-1 text-gray-400">...</span>
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ currentPage: searchFilters.currentPage + 1 })}
                  disabled={searchFilters.currentPage === totalPages}
                  className="h-9 w-9 p-0 text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 mb-4" style={{color: '#cfaf6e'}} />
            <h3 className="text-lg font-medium mb-2" style={{color: '#1a1a1a'}}>No se encontraron usuarios</h3>
            <p style={{color: '#666666'}}>Intenta ajustar los filtros o crear un nuevo usuario.</p>
          </div>
        )}
      </div>
    </div>
  )
}