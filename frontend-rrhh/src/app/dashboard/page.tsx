'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { HRQuoteCard } from '@/components/dashboard/hr-quote-card'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function Dashboard() {
  const { } = useAuth()
  const { analytics, loading, error, refreshAnalytics } = useAnalytics()

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard ejecutivo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>Error al cargar los datos: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAnalytics}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const kpis = analytics?.kpis

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-gray-600 mt-1">Panel de control de métricas estratégicas</p>
        </div>
        <Button
          onClick={refreshAnalytics}
          variant="outline"
          className="border-amber-300 hover:bg-amber-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* HR Quote Card */}
      <HRQuoteCard />

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time to Hire */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Time to Hire
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.timeToHire.value || 0} días
            </div>
            <div className={`flex items-center text-xs mt-1 ${
              kpis?.timeToHire.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {kpis?.timeToHire.trend === 'up' ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(kpis?.timeToHire.change || 0)} días
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aplicaciones (mes)
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.applications.value || 0}
            </div>
            <div className={`flex items-center text-xs mt-1 ${
              kpis?.applications.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {kpis?.applications.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {kpis?.applications.change || 0}%
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tasa de Conversión
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.conversionRate.value || 0}%
            </div>
            <div className={`flex items-center text-xs mt-1 ${
              kpis?.conversionRate.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {kpis?.conversionRate.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {kpis?.conversionRate.change.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>

        {/* Hired */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Contrataciones (mes)
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.hired.value || 0}
            </div>
            <div className={`flex items-center text-xs mt-1 ${
              kpis?.hired.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {kpis?.hired.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {kpis?.hired.change || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Candidatos Activos
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">{kpis?.candidates.active || 0}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Posiciones Abiertas
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">{kpis?.jobs.open || 0}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Entrevistas Hoy
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">{kpis?.interviews.today || 0}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                CVs Analizados (IA)
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-800">{kpis?.aiAnalyses.period || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Funnel */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-800">
                Funnel de Reclutamiento
                <Badge variant="outline" className="ml-2">
                  Conversión: {analytics?.funnel.totalConversionRate || 0}%
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Análisis del proceso de contratación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.funnel.stages.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{stage.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stage.conversion}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Actions */}
        <div>
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">Alertas y Acciones</CardTitle>
              <CardDescription className="text-gray-600">
                {analytics?.alerts.length || 0} notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics?.alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Todo en orden</p>
                </div>
              ) : (
                analytics?.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'urgent'
                        ? 'bg-red-50 border-red-200'
                        : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {alert.type === 'urgent' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : alert.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Stats */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Análisis por Departamento</CardTitle>
          <CardDescription className="text-gray-600">
            Rendimiento de reclutamiento por área
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Departamento
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                    Jobs Activos
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                    Aplicaciones
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                    Contratados
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                    Conversión
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics?.departmentStats.map((dept, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {dept.activeJobs}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {dept.totalApplications}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {dept.hired}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">{dept.conversionRate}%</Badge>
                    </td>
                  </tr>
                ))}
                {!analytics?.departmentStats.length && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No hay datos de departamentos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Source Effectiveness */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Efectividad por Fuente</CardTitle>
          <CardDescription className="text-gray-600">
            ROI por canal de reclutamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics?.sourceEffectiveness.map((source, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                  {source.source}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{source.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contratados:</span>
                    <span className="font-medium">{source.hired}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t">
                    <span className="text-gray-600">Conversión:</span>
                    <Badge>{source.conversionRate}%</Badge>
                  </div>
                </div>
              </div>
            ))}
            {!analytics?.sourceEffectiveness.length && (
              <div className="col-span-full py-8 text-center text-gray-500">
                No hay datos de fuentes disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
