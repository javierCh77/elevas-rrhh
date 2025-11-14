'use client'

import { useRouter } from 'next/navigation'
import { Settings, User, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'
import GlobalSearch from './global-search'

interface TopMenuProps {
  onToggleMobileSidebar: () => void
  onToggleDesktopSidebar: () => void
  isMobileSidebarOpen: boolean
  isDesktopSidebarCollapsed: boolean
}

export default function TopMenu({ onToggleMobileSidebar, onToggleDesktopSidebar, isMobileSidebarOpen, isDesktopSidebarCollapsed }: TopMenuProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-4 z-40 mx-0 lg:mx-6 lg:mr-6 rounded-3xl" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(254, 252, 245, 0.6) 50%, rgba(253, 247, 230, 0.7) 100%)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(207, 175, 110, 0.2)',
      boxShadow: '0 8px 32px rgba(207, 175, 110, 0.1), 0 16px 64px rgba(163, 125, 67, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }}>
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileSidebar}
            className="lg:hidden transition-all duration-300 cursor-pointer hover:-translate-y-0.5 rounded-xl"
            style={{color: '#424242'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.color = '#a37d43'
              e.currentTarget.style.backdropFilter = 'blur(10px)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(207, 175, 110, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#424242'
              e.currentTarget.style.backdropFilter = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop sidebar toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex transition-all duration-300 cursor-pointer hover:-translate-y-0.5 rounded-xl"
            style={{color: '#424242'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.color = '#a37d43'
              e.currentTarget.style.backdropFilter = 'blur(10px)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(207, 175, 110, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#424242'
              e.currentTarget.style.backdropFilter = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
            title={isDesktopSidebarCollapsed ? "Expandir sidebar" : "Comprimir sidebar"}
          >
            {isDesktopSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>

          {/* Logo (hidden on mobile when sidebar is open) */}
          <div className={`flex items-center space-x-3 ${isMobileSidebarOpen ? 'hidden' : 'flex'} lg:hidden`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(207, 175, 110, 0.3)',
              boxShadow: '0 2px 8px rgba(207, 175, 110, 0.2)'
            }}>
              <span className="text-sm font-bold" style={{
                color: '#a37d43',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>E</span>
            </div>
            <span className="text-lg font-bold" style={{
              color: '#a37d43',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              Elevas
            </span>
          </div>

          {/* Search bar (hidden on mobile) */}
          <GlobalSearch className="hidden md:flex" />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-foreground font-medium">
                    {user ? getInitials(user.firstName, user.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role || 'Usuario'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-4">
        <GlobalSearch isMobile />
      </div>
    </header>
  )
}