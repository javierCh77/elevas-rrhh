'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Lock, Bell, Shield, Eye, EyeOff, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { userApi } from '@/lib/user-api'

export default function SettingsPage() {
  const { user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newApplications: true,
    interviewReminders: true,
    systemUpdates: false,
    weeklyReport: true
  })

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    loginAlerts: true
  })

  // Cargar preferencias al montar
  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        try {
          const prefs = await userApi.getPreferences(user.id)
          setNotifications({
            emailNotifications: prefs.emailNotifications ?? true,
            newApplications: prefs.newApplications ?? true,
            interviewReminders: prefs.interviewReminders ?? true,
            systemUpdates: prefs.systemUpdates ?? false,
            weeklyReport: prefs.weeklyReport ?? true
          })
          setSecurity({
            twoFactorAuth: prefs.twoFactorAuth ?? false,
            sessionTimeout: prefs.sessionTimeout ?? true,
            loginAlerts: prefs.loginAlerts ?? true
          })
        } catch (error) {
          console.error('Error loading preferences:', error)
        }
      }
    }
    loadPreferences()
  }, [user?.id])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsPasswordLoading(true)

    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      toast.success('Contraseña actualizada correctamente')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: unknown) {
      console.error('Error changing password:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar la contraseña'
      toast.error(errorMessage)
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    }
    setNotifications(newNotifications)

    if (user?.id) {
      try {
        await userApi.updatePreferences(user.id, {
          ...newNotifications,
          ...security
        })
        toast.success('Preferencias de notificaciones actualizadas')
      } catch (error) {
        console.error('Error saving preferences:', error)
        toast.error('Error al guardar preferencias')
        // Revertir cambio
        setNotifications(notifications)
      }
    }
  }

  const handleSecurityToggle = async (key: keyof typeof security) => {
    const newSecurity = {
      ...security,
      [key]: !security[key]
    }
    setSecurity(newSecurity)

    if (user?.id) {
      try {
        await userApi.updatePreferences(user.id, {
          ...notifications,
          ...newSecurity
        })
        toast.success('Configuración de seguridad actualizada')
      } catch (error) {
        console.error('Error saving preferences:', error)
        toast.error('Error al guardar preferencias')
        // Revertir cambio
        setSecurity(security)
      }
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tus preferencias de cuenta, seguridad y notificaciones
        </p>
      </div>

      {/* Security - Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Cambiar Contraseña</CardTitle>
          </div>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirma tu nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={isPasswordLoading}>
              {isPasswordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
          <CardDescription>
            Configura cómo y cuándo deseas recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en tu correo electrónico
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleNotificationToggle('emailNotifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newApplications">Nuevas Aplicaciones</Label>
              <p className="text-sm text-muted-foreground">
                Notificarte cuando lleguen nuevas candidaturas
              </p>
            </div>
            <Switch
              id="newApplications"
              checked={notifications.newApplications}
              onCheckedChange={() => handleNotificationToggle('newApplications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="interviewReminders">Recordatorios de Entrevistas</Label>
              <p className="text-sm text-muted-foreground">
                Recibe recordatorios antes de entrevistas programadas
              </p>
            </div>
            <Switch
              id="interviewReminders"
              checked={notifications.interviewReminders}
              onCheckedChange={() => handleNotificationToggle('interviewReminders')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="systemUpdates">Actualizaciones del Sistema</Label>
              <p className="text-sm text-muted-foreground">
                Información sobre nuevas funcionalidades y mejoras
              </p>
            </div>
            <Switch
              id="systemUpdates"
              checked={notifications.systemUpdates}
              onCheckedChange={() => handleNotificationToggle('systemUpdates')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyReport">Reporte Semanal</Label>
              <p className="text-sm text-muted-foreground">
                Resumen semanal de actividades y métricas
              </p>
            </div>
            <Switch
              id="weeklyReport"
              checked={notifications.weeklyReport}
              onCheckedChange={() => handleNotificationToggle('weeklyReport')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Seguridad</CardTitle>
          </div>
          <CardDescription>
            Configura las opciones de seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="twoFactorAuth">Autenticación de Dos Factores</Label>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recomendado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Añade una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={security.twoFactorAuth}
              onCheckedChange={() => handleSecurityToggle('twoFactorAuth')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sessionTimeout">Cierre Automático de Sesión</Label>
              <p className="text-sm text-muted-foreground">
                Cerrar sesión automáticamente después de 30 minutos de inactividad
              </p>
            </div>
            <Switch
              id="sessionTimeout"
              checked={security.sessionTimeout}
              onCheckedChange={() => handleSecurityToggle('sessionTimeout')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="loginAlerts">Alertas de Inicio de Sesión</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificación cuando alguien acceda a tu cuenta
              </p>
            </div>
            <Switch
              id="loginAlerts"
              checked={security.loginAlerts}
              onCheckedChange={() => handleSecurityToggle('loginAlerts')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle>Sesiones Activas</CardTitle>
          </div>
          <CardDescription>
            Gestiona los dispositivos donde has iniciado sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dispositivo Actual</p>
                  <p className="text-sm text-muted-foreground">
                    {navigator.userAgent.includes('Windows') ? 'Windows' :
                     navigator.userAgent.includes('Mac') ? 'MacOS' :
                     navigator.userAgent.includes('Linux') ? 'Linux' : 'Desconocido'} ·
                    {' '}Última actividad: Ahora
                  </p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Activo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
