'use client'

import { useState, useEffect } from 'react'
import { useCandidates } from './useCandidates'
import { useJobs } from './useJobs'
import { useInterviews } from './useInterviews'
import { useApplications } from './useApplications'

export interface SidebarCounts {
  candidates: number
  activeJobs: number
  todayInterviews: number
  pendingApplications: number
  loading: boolean
}

export function useSidebarCounts(): SidebarCounts {
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { interviews, loading: interviewsLoading } = useInterviews()
  const { applications, loading: applicationsLoading } = useApplications()

  const [counts, setCounts] = useState<SidebarCounts>({
    candidates: 0,
    activeJobs: 0,
    todayInterviews: 0,
    pendingApplications: 0,
    loading: true
  })

  useEffect(() => {
    // Solo calcular cuando todos los datos estén cargados
    if (!candidatesLoading && !jobsLoading && !interviewsLoading && !applicationsLoading) {
      // Candidatos activos (no en lista negra)
      const activeCandidates = candidates.filter(candidate =>
        candidate.status === 'active'
      ).length

      // Trabajos activos (no cerrados o pausados)
      const activeJobs = jobs.filter(job =>
        job.status === 'active'
      ).length

      // Entrevistas de hoy - calculamos directamente aquí
      const today = new Date()
      const todayInterviews = interviews.filter(interview => {
        const interviewDate = new Date(interview.scheduledAt)
        return interviewDate.toDateString() === today.toDateString()
      }).length

      // Aplicaciones pendientes de revisión
      const pendingApplications = applications.filter(app =>
        app.status === 'pending'
      ).length

      setCounts({
        candidates: activeCandidates,
        activeJobs: activeJobs,
        todayInterviews: todayInterviews,
        pendingApplications: pendingApplications,
        loading: false
      })
    }
  }, [candidates, jobs, interviews, applications, candidatesLoading, jobsLoading, interviewsLoading, applicationsLoading])

  return counts
}