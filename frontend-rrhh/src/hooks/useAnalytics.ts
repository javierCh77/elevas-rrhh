'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage, type ApiResponse } from '@/lib/types'

export interface KPI {
  value: number
  change: number
  trend: 'up' | 'down'
  unit?: string
}

export interface Analytics {
  kpis: {
    timeToHire: KPI
    applications: KPI
    hired: KPI
    conversionRate: KPI
    candidates: { total: number; active: number }
    jobs: { open: number; urgent: number }
    interviews: { today: number }
    aiAnalyses: { period: number }
  }
  funnel: {
    stages: Array<{
      name: string
      count: number
      percentage: number
      conversion: string
    }>
    rejected: number
    totalConversionRate: string
  }
  departmentStats: Array<{
    department: string
    activeJobs: number
    totalApplications: number
    hired: number
    avgTimeToHire: number
    conversionRate: string
  }>
  alerts: Array<{
    type: 'urgent' | 'warning' | 'opportunity'
    category: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    count: number
  }>
  sourceEffectiveness: Array<{
    source: string
    total: number
    hired: number
    conversionRate: string
  }>
}

interface UseAnalyticsReturn {
  analytics: Analytics | null
  loading: boolean
  error: string | null
  refreshAnalytics: () => Promise<void>
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<ApiResponse<Analytics>>('/analytics/dashboard')

      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        throw new Error('No se pudieron cargar los analytics')
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching analytics:', err)
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    await fetchAnalytics()
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
  }
}

// Hook for time series data
interface TimeSeriesDataPoint {
  date: string
  value: number
  [key: string]: string | number
}

export function useTimeSeries(metric: string, period: string = 'month', months: number = 6) {
  const [data, setData] = useState<TimeSeriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeSeries = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get<TimeSeriesDataPoint[]>(
          `/analytics/time-series?metric=${metric}&period=${period}&months=${months}`
        )

        if (response) {
          setData(response)
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err)
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching time series:', err)
        }
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSeries()
  }, [metric, period, months])

  return { data, loading, error }
}
