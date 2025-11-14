'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Users, Clock, Target, Calendar, BarChart3, PieChart, ArrowUp, ArrowDown, AlertTriangle, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useJobs } from '@/hooks/useJobs'
import { useApplications } from '@/hooks/useApplications'
import { useCandidates } from '@/hooks/useCandidates'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'


export default function JobAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m')

  // Datos reales de los hooks
  const { jobs, loading: jobsLoading } = useJobs()
  const { applications, loading: applicationsLoading } = useApplications()
  const { loading: candidatesLoading } = useCandidates()

  // Función para filtrar por rango de tiempo
  const filterByTimeRange = (date: string | Date, range: string) => {
    const now = new Date()
    const itemDate = new Date(date)

    const monthsMap: Record<string, number> = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12
    }

    const months = monthsMap[range] || 6
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())

    return itemDate >= startDate
  }

  // Calcular analytics reales con filtro de tiempo
  const analytics = useMemo(() => {
    if (jobsLoading || applicationsLoading || candidatesLoading) {
      return null
    }

    // Filtrar datos por rango de tiempo
    const filteredJobs = jobs.filter(job => job.createdAt && filterByTimeRange(job.createdAt, timeRange))
    const filteredApplications = applications.filter(app => app.appliedAt && filterByTimeRange(app.appliedAt, timeRange))

    // Calcular datos del periodo anterior para comparación
    const getPreviousPeriodData = () => {
      const monthsMap: Record<string, number> = {
        '1m': 1,
        '3m': 3,
        '6m': 6,
        '1y': 12
      }

      const months = monthsMap[timeRange] || 6
      const now = new Date()
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
      const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (months * 2), now.getDate())

      const prevJobs = jobs.filter(job => {
        if (!job.createdAt) return false
        const date = new Date(job.createdAt)
        return date >= previousPeriodStart && date < currentPeriodStart
      })

      const prevApps = applications.filter(app => {
        if (!app.appliedAt) return false
        const date = new Date(app.appliedAt)
        return date >= previousPeriodStart && date < currentPeriodStart
      })

      const prevHired = prevApps.filter(app => app.status === 'hired').length

      return {
        jobs: prevJobs.length,
        applications: prevApps.length,
        conversionRate: prevApps.length > 0 ? (prevHired / prevApps.length) * 100 : 0
      }
    }

    const previousPeriod = getPreviousPeriodData()

    // Stats generales
    const totalJobs = filteredJobs.length
    const activeJobs = filteredJobs.filter(job => job.status === 'active').length
    const totalApplications = filteredApplications.length

    // Calcular tiempo REAL promedio de llenado
    const calculateRealAvgTimeToFill = () => {
      const closedJobsWithHires = filteredJobs.filter(job => {
        const jobApps = applications.filter(app => app.jobId === job.id && app.status === 'hired')
        return jobApps.length > 0
      })

      if (closedJobsWithHires.length === 0) return null

      const times = closedJobsWithHires.map(job => {
        const createdAt = new Date(job.createdAt!)
        const firstHire = applications
          .filter(app => app.jobId === job.id && app.status === 'hired')
          .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime())[0]

        if (!firstHire) return null

        const hiredAt = new Date(firstHire.appliedAt)
        const diffTime = Math.abs(hiredAt.getTime() - createdAt.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      }).filter(t => t !== null) as number[]

      return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null
    }

    const avgTimeToFill = calculateRealAvgTimeToFill()

    // Apps por job
    const avgApplicationsPerJob = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 10) / 10 : 0

    // Tasa de conversión
    const hiredApplications = filteredApplications.filter(app => app.status === 'hired').length
    const conversionRate = totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 1000) / 10 : 0

    // Calcular cambios porcentuales
    const jobsChange = previousPeriod.jobs > 0 ? ((totalJobs - previousPeriod.jobs) / previousPeriod.jobs) * 100 : 0
    const appsChange = previousPeriod.applications > 0 ? ((totalApplications - previousPeriod.applications) / previousPeriod.applications) * 100 : 0
    const conversionChange = previousPeriod.conversionRate > 0 ? ((conversionRate - previousPeriod.conversionRate) / previousPeriod.conversionRate) * 100 : 0

    // Jobs por departamento
    const departmentCounts = filteredJobs.reduce((acc, job) => {
      acc[job.department] = acc[job.department] || { count: 0, applications: 0 }
      acc[job.department].count++
      acc[job.department].applications += filteredApplications.filter(app => app.jobId === job.id).length
      return acc
    }, {} as Record<string, { count: number; applications: number }>)

    const jobsByDepartment = Object.entries(departmentCounts)
      .map(([department, data]) => ({
        department,
        ...data,
        name: department // Para Recharts
      }))
      .sort((a, b) => b.count - a.count)

    // Tendencia temporal (aplicaciones por mes)
    const getTrendData = () => {
      const monthsMap: Record<string, number> = {
        '1m': 4, // 4 semanas
        '3m': 12, // 12 semanas
        '6m': 6, // 6 meses
        '1y': 12 // 12 meses
      }

      const periods = monthsMap[timeRange] || 6
      const now = new Date()
      const data = []

      for (let i = periods - 1; i >= 0; i--) {
        let periodStart, periodEnd, label

        if (timeRange === '1m' || timeRange === '3m') {
          // Por semanas
          if (i === 0) {
            // Última semana: incluye hasta HOY
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
            periodEnd = now
          } else {
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((i + 1) * 7))
            periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7))
          }
          label = `Sem ${periods - i}`
        } else {
          // Por meses
          if (i === 0) {
            // Último período: desde inicio del mes actual hasta HOY
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
            periodEnd = now
            label = now.toLocaleDateString('es-AR', { month: 'short' })
          } else {
            // Meses anteriores completos
            periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0) // Último día del mes
            label = periodStart.toLocaleDateString('es-AR', { month: 'short' })
          }
        }

        const periodApps = applications.filter(app => {
          if (!app.appliedAt) return false
          const appDate = new Date(app.appliedAt)
          // Asegurar que periodEnd incluye TODO el día
          const periodEndAdjusted = new Date(periodEnd)
          periodEndAdjusted.setHours(23, 59, 59, 999)
          return appDate >= periodStart && appDate <= periodEndAdjusted
        })

        const periodJobs = jobs.filter(job => {
          if (!job.createdAt) return false
          const jobDate = new Date(job.createdAt)
          // Asegurar que periodEnd incluye TODO el día
          const periodEndAdjusted = new Date(periodEnd)
          periodEndAdjusted.setHours(23, 59, 59, 999)
          return jobDate >= periodStart && jobDate <= periodEndAdjusted
        })

        const periodHired = periodApps.filter(app => app.status === 'hired').length

        data.push({
          period: label,
          aplicaciones: periodApps.length,
          puestos: periodJobs.length,
          contrataciones: periodHired
        })
      }

      return data
    }

    const trendData = getTrendData()

    // Funnel de conversión
    const funnelData = [
      { stage: 'Aplicaciones', count: totalApplications, percentage: 100 },
      {
        stage: 'En Revisión',
        count: filteredApplications.filter(app => ['reviewed', 'interview_scheduled', 'interviewed', 'offered'].includes(app.status)).length,
        percentage: totalApplications > 0 ? Math.round((filteredApplications.filter(app => ['reviewed', 'interview_scheduled', 'interviewed', 'offered'].includes(app.status)).length / totalApplications) * 100) : 0
      },
      {
        stage: 'Entrevista',
        count: filteredApplications.filter(app => ['interview_scheduled', 'interviewed'].includes(app.status)).length,
        percentage: totalApplications > 0 ? Math.round((filteredApplications.filter(app => ['interview_scheduled', 'interviewed'].includes(app.status)).length / totalApplications) * 100) : 0
      },
      {
        stage: 'Oferta',
        count: filteredApplications.filter(app => app.status === 'offered').length,
        percentage: totalApplications > 0 ? Math.round((filteredApplications.filter(app => app.status === 'offered').length / totalApplications) * 100) : 0
      },
      {
        stage: 'Contratado',
        count: hiredApplications,
        percentage: totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 100) : 0
      }
    ]

    // Distribución por estado
    const statusDistribution = [
      { status: 'Pendiente', count: filteredApplications.filter(app => app.status === 'pending').length, color: '#94a3b8' },
      { status: 'En Revisión', count: filteredApplications.filter(app => app.status === 'reviewed').length, color: '#60a5fa' },
      { status: 'Entrevista Prog.', count: filteredApplications.filter(app => app.status === 'interview_scheduled').length, color: '#a78bfa' },
      { status: 'Entrevistado', count: filteredApplications.filter(app => app.status === 'interviewed').length, color: '#8b5cf6' },
      { status: 'Oferta', count: filteredApplications.filter(app => app.status === 'offered').length, color: '#fbbf24' },
      { status: 'Contratado', count: filteredApplications.filter(app => app.status === 'hired').length, color: '#34d399' },
      { status: 'Rechazado', count: filteredApplications.filter(app => app.status === 'rejected').length, color: '#f87171' },
      { status: 'Retirado', count: filteredApplications.filter(app => app.status === 'withdrawn').length, color: '#9ca3af' }
    ].filter(item => item.count > 0)

    // Top performing jobs
    const jobsWithStats = filteredJobs.map(job => {
      const jobApplications = filteredApplications.filter(app => app.jobId === job.id)
      const jobHired = jobApplications.filter(app => app.status === 'hired').length
      const jobConversionRate = jobApplications.length > 0 ? Math.round((jobHired / jobApplications.length) * 1000) / 10 : 0

      // Calcular tiempo real para este job
      let realTimeToFill = null
      if (jobHired > 0 && job.createdAt) {
        const createdAt = new Date(job.createdAt)
        const firstHire = jobApplications
          .filter(app => app.status === 'hired')
          .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime())[0]

        if (firstHire) {
          const hiredAt = new Date(firstHire.appliedAt)
          const diffTime = Math.abs(hiredAt.getTime() - createdAt.getTime())
          realTimeToFill = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
      }

      return {
        ...job,
        applications: jobApplications.length,
        conversionRate: jobConversionRate,
        avgTimeToFill: realTimeToFill,
      }
    }).sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 4)

    // Métricas de urgencia
    const urgentMetrics = {
      urgentUnfilled: filteredJobs.filter(job =>
        job.isUrgent &&
        job.status === 'active' &&
        filteredApplications.filter(app => app.jobId === job.id && app.status === 'hired').length === 0
      ).length,
      nearDeadline: filteredJobs.filter(job => {
        if (!job.deadline || job.status !== 'active') return false
        const deadline = new Date(job.deadline)
        const now = new Date()
        const daysToDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysToDeadline <= 7 && daysToDeadline >= 0
      }).length,
      lowApplications: filteredJobs.filter(job => {
        const jobApps = filteredApplications.filter(app => app.jobId === job.id).length
        return job.status === 'active' && jobApps < 5
      }).length
    }

    return {
      overview: {
        totalJobs,
        activeJobs,
        totalApplications,
        avgTimeToFill,
        avgApplicationsPerJob,
        conversionRate,
        jobsChange,
        appsChange,
        conversionChange
      },
      jobsByDepartment,
      topPerformingJobs: jobsWithStats,
      trendData,
      funnelData,
      statusDistribution,
      urgentMetrics
    }
  }, [jobs, applications, jobsLoading, applicationsLoading, candidatesLoading, timeRange])

  if (!analytics) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  const COLORS = ['#cfaf6e', '#a37d43', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa']

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      {/* Main Container with proper padding */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
                Analytics de Puestos
              </h1>
              <p className="text-sm sm:text-base text-amber-700/80 leading-relaxed">
                Métricas y análisis del rendimiento de vacantes y reclutamiento
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11 transition-all duration-200 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200" style={{ borderRadius: '12px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mes</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alertas de Urgencia */}
        {(analytics.urgentMetrics.urgentUnfilled > 0 || analytics.urgentMetrics.nearDeadline > 0 || analytics.urgentMetrics.lowApplications > 0) && (
          <Card className="border-orange-200 bg-orange-50/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">Alertas de Atención Requerida</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {analytics.urgentMetrics.urgentUnfilled > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500 text-white">{analytics.urgentMetrics.urgentUnfilled}</Badge>
                        <span className="text-orange-800">Puestos urgentes sin cubrir</span>
                      </div>
                    )}
                    {analytics.urgentMetrics.nearDeadline > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500 text-white">{analytics.urgentMetrics.nearDeadline}</Badge>
                        <span className="text-orange-800">Próximos a deadline (≤7 días)</span>
                      </div>
                    )}
                    {analytics.urgentMetrics.lowApplications > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 text-white">{analytics.urgentMetrics.lowApplications}</Badge>
                        <span className="text-orange-800">Puestos con pocas apps (&lt;5)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats - Mobile First con Comparativas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {/* Total Puestos */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {analytics.overview.jobsChange !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${analytics.overview.jobsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.jobsChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(Math.round(analytics.overview.jobsChange))}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Puestos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.overview.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aplicaciones */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {analytics.overview.appsChange !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${analytics.overview.appsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.appsChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(Math.round(analytics.overview.appsChange))}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Aplicaciones</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.overview.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tiempo Promedio */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-orange-500 to-red-500">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Tiempo Prom.</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {analytics.overview.avgTimeToFill !== null ? (
                      <>{analytics.overview.avgTimeToFill}<span className="text-sm text-gray-500 ml-1">días</span></>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apps por Puesto */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-500 to-violet-500">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Apps/Puesto</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.overview.avgApplicationsPerJob}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasa de Conversión */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {analytics.overview.conversionChange !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${analytics.overview.conversionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.conversionChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(Math.round(analytics.overview.conversionChange))}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Conversión</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.overview.conversionRate}<span className="text-sm text-gray-500 ml-1">%</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Puestos Activos */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Activos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.overview.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos - Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia Temporal */}
          <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(207, 175, 110, 0.1)',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <TrendingUp className="h-4 w-4" style={{color: '#cfaf6e'}} />
                </div>
                <span style={{color: '#1a1a1a'}}>Tendencia Temporal</span>
              </CardTitle>
              <CardDescription style={{color: '#666666', marginTop: '8px'}}>
                Evolución de aplicaciones, puestos y contrataciones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {analytics.trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      allowDecimals={false}
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #cfaf6e',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="aplicaciones"
                      stroke="#cfaf6e"
                      strokeWidth={3}
                      name="Aplicaciones"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="puestos"
                      stroke="#60a5fa"
                      strokeWidth={3}
                      name="Puestos Creados"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="contrataciones"
                      stroke="#34d399"
                      strokeWidth={3}
                      name="Contrataciones"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No hay datos suficientes para mostrar la tendencia en este período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribución por Estado */}
          <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(207, 175, 110, 0.1)',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <PieChart className="h-4 w-4" style={{color: '#cfaf6e'}} />
                </div>
                <span style={{color: '#1a1a1a'}}>Distribución por Estado</span>
              </CardTitle>
              <CardDescription style={{color: '#666666', marginTop: '8px'}}>
                Estado actual de todas las aplicaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: Record<string, unknown>) => `${props.status}: ${((props.percent as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Funnel y Departamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel de Conversión */}
          <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(207, 175, 110, 0.1)',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <Filter className="h-4 w-4" style={{color: '#cfaf6e'}} />
                </div>
                <span style={{color: '#1a1a1a'}}>Funnel de Conversión</span>
              </CardTitle>
              <CardDescription style={{color: '#666666', marginTop: '8px'}}>
                Embudo del proceso de reclutamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {analytics.funnelData.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                      <span className="text-sm font-semibold text-gray-900">{stage.count} ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="h-8 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                        style={{
                          width: `${stage.percentage}%`,
                          background: `linear-gradient(90deg, ${COLORS[index]}, ${COLORS[index + 1] || COLORS[index]})`
                        }}
                      >
                        {stage.percentage > 10 && `${stage.percentage}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Puestos por Departamento */}
          <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(207, 175, 110, 0.1)',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <BarChart3 className="h-4 w-4" style={{color: '#cfaf6e'}} />
                </div>
                <span style={{color: '#1a1a1a'}}>Puestos por Departamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.jobsByDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="department" type="category" width={100} stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #cfaf6e',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#cfaf6e" name="Puestos" />
                  <Bar dataKey="applications" fill="#60a5fa" name="Aplicaciones" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Jobs */}
        <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                backgroundColor: 'rgba(207, 175, 110, 0.1)',
                border: '1px solid rgba(207, 175, 110, 0.2)'
              }}>
                <TrendingUp className="h-4 w-4" style={{color: '#cfaf6e'}} />
              </div>
              <span style={{color: '#1a1a1a'}}>Puestos con Mejor Rendimiento</span>
            </CardTitle>
            <CardDescription style={{color: '#666666', marginTop: '8px'}}>
              Vacantes ordenadas por tasa de conversión y aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {analytics.topPerformingJobs.length > 0 ? (
                analytics.topPerformingJobs.map((job, index) => (
                  <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:border-yellow-300" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderColor: 'rgba(207, 175, 110, 0.2)'
                  }}>
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm" style={{
                        backgroundColor: index === 0 ? '#cfaf6e' : 'rgba(207, 175, 110, 0.2)',
                        color: index === 0 ? 'white' : '#cfaf6e',
                        border: '1px solid rgba(207, 175, 110, 0.3)'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-base" style={{color: '#1a1a1a'}}>{job.title}</h3>
                        <Badge
                          className="mt-1"
                          style={{
                            backgroundColor: job.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                            color: job.status === 'active' ? '#16a34a' : '#6b7280',
                            border: `1px solid ${job.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`
                          }}
                        >
                          {job.status === 'active' ? 'Activo' : 'Cerrado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold" style={{color: '#1a1a1a'}}>{job.applications}</div>
                        <div style={{color: '#666666'}}>Apps</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold" style={{color: '#1a1a1a'}}>{job.conversionRate}%</div>
                        <div style={{color: '#666666'}}>Conversión</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold" style={{color: '#1a1a1a'}}>
                          {job.avgTimeToFill !== null ? `${job.avgTimeToFill}d` : 'N/A'}
                        </div>
                        <div style={{color: '#666666'}}>Tiempo</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay puestos disponibles para mostrar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
