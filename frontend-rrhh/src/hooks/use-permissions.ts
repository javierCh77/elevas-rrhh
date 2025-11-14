import { useAuth } from '@/contexts/auth-context'
import {
  hasPermission,
  canAccessMenu,
  isAdmin,
  isHR,
  isManager,
  canManageEmployees,
  canAccessRecruitment,
  canAccessReports,
  canAccessEVA,
  type UserRole
} from '@/lib/permissions'

export function usePermissions() {
  const { user } = useAuth()
  const userRole = user?.role as UserRole | undefined

  return {
    // Basic permission check
    hasPermission: (resource: string, action: string) =>
      hasPermission(userRole, resource, action),

    // Menu access
    canAccessMenu: (menuTitle: string) =>
      canAccessMenu(userRole, menuTitle),

    // Role checks
    isAdmin: () => isAdmin(userRole),
    isHR: () => isHR(userRole),
    isManager: () => isManager(userRole),

    // Feature access checks
    canManageEmployees: () => canManageEmployees(userRole),
    canAccessRecruitment: () => canAccessRecruitment(userRole),
    canAccessReports: () => canAccessReports(userRole),
    canAccessEVA: () => canAccessEVA(userRole),

    // Current user role
    userRole,

    // Convenience methods for common checks
    canCreate: (resource: string) => hasPermission(userRole, resource, 'create'),
    canRead: (resource: string) => hasPermission(userRole, resource, 'read'),
    canUpdate: (resource: string) => hasPermission(userRole, resource, 'update'),
    canDelete: (resource: string) => hasPermission(userRole, resource, 'delete'),
  }
}