'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface Job {
  id: string
  title: string
  department: string
  location?: string
  modality?: string
  contractType?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  description: string
  responsibilities?: string
  requirements?: string
  benefits?: string
  skills?: string[]
  status: 'draft' | 'active' | 'paused' | 'closed'
  isUrgent: boolean
  isRemote: boolean
  deadline?: Date
  createdAt: Date
  updatedAt: Date
  applicationsCount: number
  viewsCount: number
  createdBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  salaryRange?: string
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Job[]>('/jobs')

      // Add computed properties
      const jobsWithComputedProps = data.map(job => ({
        ...job,
        salaryRange: job.salaryMin && job.salaryMax
          ? `${job.salaryMin}€ - ${job.salaryMax}€`
          : job.salaryMin
            ? `Desde ${job.salaryMin}€`
            : job.salaryMax
              ? `Hasta ${job.salaryMax}€`
              : undefined
      }))

      setJobs(jobsWithComputedProps)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Error al cargar los puestos de trabajo')
    } finally {
      setLoading(false)
    }
  }

  const updateJobStatus = async (jobId: string, action: 'publish' | 'pause' | 'close' | 'activate') => {
    try {
      await api.patch(`/jobs/${jobId}/${action}`)
      // Refresh jobs list
      await fetchJobs()
      return true
    } catch (err) {
      console.error(`Error ${action} job:`, err)
      return false
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      await api.delete(`/jobs/${jobId}`)
      // Refresh jobs list
      await fetchJobs()
      return true
    } catch (err) {
      console.error('Error deleting job:', err)
      return false
    }
  }

  const updateJob = async (jobId: string, jobData: Partial<Job>) => {
    try {
      await api.patch(`/jobs/${jobId}`, jobData)
      // Refresh jobs list
      await fetchJobs()
      return true
    } catch (err) {
      console.error('Error updating job:', err)
      return false
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    updateJobStatus,
    deleteJob,
    updateJob
  }
}