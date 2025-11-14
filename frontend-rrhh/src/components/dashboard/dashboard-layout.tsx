'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import TopMenu from './top-menu'
import Sidebar from './sidebar'
import { EvaFloatingChat } from '@/components/chat/eva-floating-chat'
import { useAuth } from '@/contexts/auth-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl animate-pulse"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{
      background: 'linear-gradient(135deg, #fdfcf5 0%, #fef9ea 50%, #fdf7e6 100%)'
    }}>
      {/* Sidebar - Fixed position, outside of flex flow */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        isDesktopCollapsed={isDesktopSidebarCollapsed}
        onMobileClose={closeMobileSidebar}
        onDesktopToggle={toggleDesktopSidebar}
      />

      {/* Main content area - Takes full height, positioned with margin for sidebar */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-500 ease-in-out ${
        isDesktopSidebarCollapsed
          ? 'lg:ml-24'
          : 'lg:ml-80'
      }`}>
        {/* Top menu - Fixed height */}
        <TopMenu
          onToggleMobileSidebar={toggleMobileSidebar}
          onToggleDesktopSidebar={toggleDesktopSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
          isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
        />

        {/* Page content - Scrollable area with proper spacing */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 pt-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* EVA Floating Chat - Available globally except on CV Analysis page */}
      {pathname !== '/dashboard/cv-analysis' && <EvaFloatingChat />}
    </div>
  )
}