'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  BarChart3,
  Brain,
  ChevronDown,
  ChevronRight,
  Calendar,
  Mail,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { canAccessMenu, type UserRole } from '@/lib/permissions'

interface SidebarProps {
  isMobileOpen: boolean
  isDesktopCollapsed: boolean
  onMobileClose: () => void
  onDesktopToggle: () => void
}

interface MenuItem {
  title: string
  icon: React.ElementType
  href?: string
  badge?: string
  children?: MenuItem[]
}

export default function Sidebar({ isMobileOpen, isDesktopCollapsed, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Reclutamiento', 'Puestos de Trabajo'])
  const { user } = useAuth()

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // Define menuItems dentro del componente para acceder a los contadores
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard'
    },
    {
      title: 'Reclutamiento',
      icon: UserPlus,
      children: [
        { title: 'Candidatos', icon: Users, href: '/dashboard/candidates' },
        { title: 'Calendario', icon: Calendar, href: '/dashboard/recruitment/interviews' },
        { title: 'Mensajería', icon: Mail, href: '/dashboard/recruitment/messages' },
        { title: 'WhatsApp', icon: MessageCircle, href: '/dashboard/recruitment/whatsapp' }
      ]
    },
    {
      title: 'Puestos de Trabajo',
      icon: Briefcase,
      children: [
        { title: 'Ver Puestos', icon: Briefcase, href: '/dashboard/jobs' },
        { title: 'Analytics', icon: BarChart3, href: '/dashboard/jobs/analytics' }
      ]
    },
    {
      title: 'EVA Copiloto AI',
      icon: Brain,
      href: '/dashboard/cv-analysis'
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      children: [
        { title: 'Lista de Usuarios', icon: Users, href: '/dashboard/users' },
        { title: 'Crear Usuario', icon: UserPlus, href: '/dashboard/users/create' }
      ]
    },
  ]

  // Filter menu items based on user role using permissions system
  const getFilteredMenuItems = () => {
    if (!user || !user.role) return []

    const userRole = user.role as UserRole
    const filtered = menuItems.filter(item => canAccessMenu(userRole, item.title))

    return filtered
  }

  const filteredMenuItems = getFilteredMenuItems()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    // Exact match for specific routes to avoid multiple active states
    return pathname === href
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        role="complementary"
        className={cn(
          "fixed top-4 left-4 z-50 transform transition-all duration-500 ease-in-out flex flex-col rounded-3xl",
          // Mobile behavior - slides in/out from left
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop behavior - always visible, just changes width
          isDesktopCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile width is always full when open
          "w-72",
          // Height adjustment for modern look
          "h-[calc(100vh-2rem)]"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(254, 252, 245, 0.6) 50%, rgba(253, 247, 230, 0.7) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(207, 175, 110, 0.2)',
          boxShadow: '0 8px 32px rgba(207, 175, 110, 0.1), 0 16px 64px rgba(163, 125, 67, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center justify-center py-4 flex-shrink-0",
          isDesktopCollapsed ? "h-16" : "h-20"
        )} style={{
          borderBottom: '1px solid rgba(207, 175, 110, 0.15)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}>
          <div className={cn(
            "flex items-center justify-center transition-all duration-300 overflow-hidden",
            isDesktopCollapsed ? "lg:px-1" : "px-4"
          )}>
            <Image
              src="/logoelevas.png"
              alt="Elevas Logo"
              width={isDesktopCollapsed ? 28 : 112}
              height={isDesktopCollapsed ? 28 : 42}
              className={cn(
                "object-contain transition-all duration-300",
                isDesktopCollapsed ? "lg:w-7 lg:h-7" : "w-28 h-auto"
              )}
              priority
            />
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className={cn(
            "space-y-1 transition-all duration-300",
            isDesktopCollapsed ? "lg:px-1" : "px-3"
          )}>
              {filteredMenuItems.map((item) => (
                <div key={item.title}>
                  {'children' in item && item.children ? (
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => !isDesktopCollapsed && toggleExpanded(item.title)}
                        className={cn(
                          "w-full font-medium relative group transition-all duration-300 cursor-pointer hover:-translate-y-0.5 rounded-2xl",
                          isDesktopCollapsed
                            ? "lg:justify-center lg:px-2 lg:py-2"
                            : "justify-between px-4 py-2.5 text-left"
                        )}
                        style={{
                          color: '#424242',
                          backgroundColor: 'transparent'
                        }}
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
                        title={isDesktopCollapsed ? item.title : undefined}
                      >
                        <div className={cn(
                          "flex items-center transition-all duration-300",
                          isDesktopCollapsed ? "lg:space-x-0" : "space-x-3"
                        )}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className={cn(
                            "text-sm transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isDesktopCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                          )}>
                            {item.title}
                          </span>
                        </div>
                        {!isDesktopCollapsed && (
                          <div className="lg:block hidden">
                            {expandedItems.includes(item.title) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isDesktopCollapsed && (
                          <div className="absolute left-full ml-3 px-4 py-2 text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap hidden lg:block" style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(207, 175, 110, 0.2)',
                            boxShadow: '0 8px 24px rgba(207, 175, 110, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                            color: '#424242'
                          }}>
                            {item.title}
                          </div>
                        )}
                      </Button>

                      {!isDesktopCollapsed && expandedItems.includes(item.title) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link key={child.title} href={child.href!}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start px-3 py-2 text-sm transition-all duration-300 rounded-2xl",
                                  isActive(child.href!)
                                    ? "font-medium"
                                    : ""
                                )}
                                style={{
                                  color: isActive(child.href!) ? '#a37d43' : '#666666',
                                  backgroundColor: isActive(child.href!) ? 'rgba(255, 255, 255, 0.6)' : 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive(child.href!)) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
                                    e.currentTarget.style.color = '#a37d43'
                                    e.currentTarget.style.backdropFilter = 'blur(10px)'
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(207, 175, 110, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive(child.href!)) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = '#666666'
                                    e.currentTarget.style.backdropFilter = 'none'
                                    e.currentTarget.style.boxShadow = 'none'
                                  }
                                }}
                              >
                                <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                <span className="flex-1 text-left">{child.title}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href!}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full font-medium text-foreground hover:bg-accent hover:text-accent-foreground relative group",
                          isDesktopCollapsed
                            ? "lg:justify-center lg:px-2 lg:py-2"
                            : "justify-start px-3 py-2",
                          isActive(item.href!) && "bg-accent text-accent-foreground"
                        )}
                        title={isDesktopCollapsed ? item.title : undefined}
                      >
                        <div className={cn(
                          "flex items-center transition-all duration-300",
                          isDesktopCollapsed ? "lg:space-x-0" : "space-x-3"
                        )}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className={cn(
                            "text-sm transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isDesktopCollapsed ? "lg:w-0 lg:opacity-0" : "flex-1 text-left opacity-100"
                          )}>
                            {item.title}
                          </span>
                        </div>

                        {/* Tooltip for collapsed state */}
                        {isDesktopCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap hidden lg:block shadow-md border">
                            {item.title}
                          </div>
                        )}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </nav>

        {/* Powered by footer - FIXED FOOTER */}
        <div className={cn(
          "border-t transition-all duration-300 rounded-b-3xl",
          isDesktopCollapsed ? "lg:p-2" : "p-4"
        )} style={{
          borderTop: '1px solid rgba(207, 175, 110, 0.15)',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <div className="text-center">
            <div className={cn(
              "text-xs flex items-center justify-center gap-1 transition-all duration-300",
              isDesktopCollapsed ? "lg:flex-col lg:gap-0" : "gap-1"
            )} style={{color: '#999999'}}>
              <span className={cn(
                "transition-all duration-300",
                isDesktopCollapsed ? "lg:text-[10px]" : "text-xs"
              )}>Powered by</span>
              <a
                href="https://www.argix.ai"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "font-semibold transition-all duration-200 hover:underline cursor-pointer",
                  isDesktopCollapsed ? "lg:text-[10px]" : "text-xs"
                )}
                style={{color: '#cfaf6e'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#a37d43'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#cfaf6e'
                }}
                title={isDesktopCollapsed ? "Powered by Argix" : undefined}
              >
                Argix
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}