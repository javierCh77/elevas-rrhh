'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface BackendApplication {
  id: string
  coverLetter?: string
  resumeUrl?: string
  status: 'pending' | 'reviewed' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
  source: string
  createdAt: Date
  updatedAt: Date
  reviewedAt?: Date
  reviewedById?: string
  jobId: string
  candidateId: string
  candidate?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    dni?: string
    location?: string
    yearsOfExperience?: number
    skills?: string[]
  }
  job?: {
    id: string
    title: string
    department: string
    location?: string
    status: string
    description?: string
    salaryMin?: number
    salaryMax?: number
    modality?: string
    contractType?: string
  }
  reviewedBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface Application {
  id: string
  jobId: string
  status: 'pending' | 'reviewed' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
  appliedAt: Date
  coverLetter?: string
  resumeUrl?: string
  candidate: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    location?: string
    experience?: string
    skills?: string[]
  }
  job?: {
    id: string
    title: string
    department: string
    location?: string
    status: string
    description?: string
    salaryMin?: number
    salaryMax?: number
    modality?: string
    contractType?: string
  }
  reviewedBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

// Transform backend application to frontend format
const transformApplication = (backendApp: BackendApplication): Application => {
  return {
    id: backendApp.id,
    jobId: backendApp.jobId,
    status: backendApp.status as Application['status'],
    appliedAt: new Date(backendApp.createdAt),
    coverLetter: backendApp.coverLetter,
    resumeUrl: backendApp.resumeUrl,
    candidate: {
      firstName: backendApp.candidate?.firstName || '',
      lastName: backendApp.candidate?.lastName || '',
      email: backendApp.candidate?.email || '',
      phone: backendApp.candidate?.phone,
      location: backendApp.candidate?.location,
      experience: backendApp.candidate?.yearsOfExperience ? `${backendApp.candidate.yearsOfExperience} años` : undefined,
      skills: backendApp.candidate?.skills
    },
    job: backendApp.job,
    reviewedBy: backendApp.reviewedBy
  }
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<BackendApplication[]>('/applications')
      const transformedData = data.map(transformApplication)
      setApplications(transformedData)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Error al cargar las aplicaciones')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await api.patch(`/applications/${applicationId}`, { status, notes })
      // Refresh applications list
      await fetchApplications()
      return true
    } catch (err) {
      console.error('Error updating application status:', err)
      return false
    }
  }

  const deleteApplication = async (applicationId: string) => {
    try {
      await api.delete(`/applications/${applicationId}`)
      // Refresh applications list
      await fetchApplications()
      return true
    } catch (err) {
      console.error('Error deleting application:', err)
      return false
    }
  }

  const addCandidateNote = async (candidateEmail: string, candidateFirstName: string, candidateLastName: string, content: string, type?: string) => {
    try {
      await api.post('/candidate-notes', {
        candidateEmail,
        candidateFirstName,
        candidateLastName,
        content,
        type
      })
      return true
    } catch (err) {
      console.error('Error adding candidate note:', err)
      return false
    }
  }

  const getCandidateNotes = async (candidateEmail: string) => {
    try {
      const notes = await api.get(`/candidate-notes/by-candidate?email=${encodeURIComponent(candidateEmail)}`)
      return notes
    } catch (err) {
      console.error('Error fetching candidate notes:', err)
      return []
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    updateApplicationStatus,
    deleteApplication,
    addCandidateNote,
    getCandidateNotes
  }
}