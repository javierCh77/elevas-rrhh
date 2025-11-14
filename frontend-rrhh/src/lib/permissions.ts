// Role-based permissions system
export type UserRole = 'admin' | 'hr' | 'manager' | 'employee'

export interface Permission {
  resource: string
  actions: string[]
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  employee: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'employees', actions: ['read'] },
    { resource: 'documents', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'employees', actions: ['read', 'update'] },
    { resource: 'recruitment', actions: ['read'] },
    { resource: 'jobs', actions: ['read'] },
    { resource: 'documents', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  hr: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'employees', actions: ['read', 'create', 'update'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'recruitment', actions: ['read', 'create', 'update'] },
    { resource: 'jobs', actions: ['read', 'create', 'update'] },
    { resource: 'documents', actions: ['read', 'create', 'update'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'eva', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  admin: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'employees', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'recruitment', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'jobs', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'documents', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'eva', actions: ['read', 'create', 'update'] },
    { resource: 'settings', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ]
}

// Menu sections that each role can access
export const ROLE_MENU_ACCESS: Record<UserRole, string[]> = {
  employee: [
    'Dashboard',
    'Empleados',
    'Documentos'
  ],
  manager: [
    'Dashboard',
    'Empleados',
    'Reclutamiento',
    'Puestos de Trabajo',
    'Documentos',
    'Reportes'
  ],
  hr: [
    'Dashboard',
    'Gestión de Usuarios',
    'Reclutamiento',
    'Empleados',
    'Puestos de Trabajo',
    'EVA Copiloto AI',
    'Documentos',
    'Reportes'
  ],
  admin: [
    'Dashboard',
    'Gestión de Usuarios',
    'Reclutamiento',
    'Empleados',
    'Puestos de Trabajo',
    'EVA Copiloto AI',
    'Documentos',
    'Reportes',
    'Configuración'
  ]
}

// Check if a user has permission for a specific resource and action
export function hasPermission(
  userRole: UserRole | undefined,
  resource: string,
  action: string
): boolean {
  if (!userRole) return false

  const permissions = ROLE_PERMISSIONS[userRole] || []
  const resourcePermission = permissions.find(p => p.resource === resource)

  return resourcePermission ? resourcePermission.actions.includes(action) : false
}

// Check if a user can access a specific menu section
export function canAccessMenu(
  userRole: UserRole | undefined,
  menuTitle: string
): boolean {
  if (!userRole) return false

  const allowedMenus = ROLE_MENU_ACCESS[userRole] || []
  return allowedMenus.includes(menuTitle)
}

// Get all permissions for a role
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || []
}

// Check if user is admin
export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === 'admin'
}

// Check if user is HR
export function isHR(userRole: UserRole | undefined): boolean {
  return userRole === 'hr' || userRole === 'admin'
}

// Check if user is Manager or above
export function isManager(userRole: UserRole | undefined): boolean {
  return userRole === 'manager' || userRole === 'hr' || userRole === 'admin'
}

// Check if user can manage employees
export function canManageEmployees(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'employees', 'update') || hasPermission(userRole, 'employees', 'create')
}

// Check if user can access recruitment features
export function canAccessRecruitment(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'recruitment', 'read')
}

// Check if user can access reports
export function canAccessReports(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'reports', 'read')
}

// Check if user can access EVA AI features
export function canAccessEVA(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'eva', 'read')
}

// Check if user can manage users
export function canManageUsers(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'users', 'read')
}

// Check if user can create users
export function canCreateUsers(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'users', 'create')
}

// Check if user can edit users
export function canEditUsers(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'users', 'update')
}

// Check if user can delete users
export function canDeleteUsers(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'users', 'delete')
}