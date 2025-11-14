'use client'

import { Toaster } from 'sonner'

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 252, 245, 0.85) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(207, 175, 110, 0.3)',
          boxShadow: '0 8px 32px rgba(207, 175, 110, 0.15), 0 16px 64px rgba(163, 125, 67, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          padding: '16px',
          color: '#424242',
          fontSize: '14px',
          fontWeight: '500'
        },
        classNames: {
          toast: 'sonner-toast-glass',
          title: 'sonner-toast-title',
          description: 'sonner-toast-description',
          success: 'sonner-toast-success',
          error: 'sonner-toast-error',
          info: 'sonner-toast-info',
          warning: 'sonner-toast-warning',
          loading: 'sonner-toast-loading',
          closeButton: 'sonner-close-button'
        }
      }}
      style={{
        '--normal-bg': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 252, 245, 0.85) 100%)',
        '--normal-border': '1px solid rgba(207, 175, 110, 0.3)',
        '--normal-text': '#424242',
        '--success-bg': 'linear-gradient(135deg, rgba(220, 252, 231, 0.9) 0%, rgba(187, 247, 208, 0.85) 100%)',
        '--success-border': '1px solid rgba(34, 197, 94, 0.3)',
        '--success-text': '#166534',
        '--error-bg': 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.85) 100%)',
        '--error-border': '1px solid rgba(239, 68, 68, 0.3)',
        '--error-text': '#991b1b',
        '--info-bg': 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.85) 100%)',
        '--info-border': '1px solid rgba(59, 130, 246, 0.3)',
        '--info-text': '#1e40af',
        '--warning-bg': 'linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(254, 243, 199, 0.85) 100%)',
        '--warning-border': '1px solid rgba(245, 158, 11, 0.3)',
        '--warning-text': '#92400e'
      } as React.CSSProperties}
    />
  )
}
