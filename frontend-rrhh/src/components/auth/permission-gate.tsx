import { usePermissions } from '@/hooks/use-permissions'
import { type UserRole } from '@/lib/permissions'

interface PermissionGateProps {
  children: React.ReactNode
  resource?: string
  action?: string
  role?: UserRole | UserRole[]
  menu?: string
  fallback?: React.ReactNode
  requireAll?: boolean // If multiple conditions, require all to be true (default: false - any can be true)
}

export function PermissionGate({
  children,
  resource,
  action,
  role,
  menu,
  fallback = null,
  requireAll = false
}: PermissionGateProps) {
  const permissions = usePermissions()

  const checks: boolean[] = []

  // Check resource permission
  if (resource && action) {
    checks.push(permissions.hasPermission(resource, action))
  }

  // Check role permission
  if (role) {
    const roles = Array.isArray(role) ? role : [role]
    checks.push(roles.includes(permissions.userRole!))
  }

  // Check menu access
  if (menu) {
    checks.push(permissions.canAccessMenu(menu))
  }

  // If no checks defined, deny access
  if (checks.length === 0) {
    return <>{fallback}</>
  }

  // Evaluate checks
  const hasAccess = requireAll
    ? checks.every(check => check)
    : checks.some(check => check)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function HROnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={['admin', 'hr']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function ManagerAndAbove({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={['admin', 'hr', 'manager']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function EmployeeAccess({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={['admin', 'hr', 'manager', 'employee']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}