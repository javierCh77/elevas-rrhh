'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface BackendInterview {
  id: string
  applicationId: string
  candidateId: string
  jobId: string
  scheduledDate: string
  scheduledTime: string
  duration?: number
  durationMinutes?: number
  type: string
  status: string
  interviewerName?: string
  interviewerEmail?: string
  meetingLink?: string
  location?: string
  notes?: string
  interviewerNotes?: string
  rating?: number
  feedback?: string
  createdAt: string
  updatedAt: string
  candidate?: {
    id: string
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
    hiringManager?: string
  }
  interviewer?: {
    firstName: string
    lastName: string
    email: string
  }
  application?: {
    candidate?: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone?: string
      location?: string
      experience?: string
    }
    job?: {
      id: string
      title: string
      department: string
      location?: string
      hiringManager?: string
    }
  }
}

export interface Interview {
  id: string
  applicationId: string
  candidateId: string
  jobId: string
  scheduledAt: Date
  duration: number // en minutos
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'virtual' | 'presencial' | 'telefonica'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled' | 'programada' | 'completada' | 'cancelada' | 'reprogramada'
  interviewerName?: string
  interviewerEmail?: string
  meetingLink?: string
  location?: string
  notes?: string
  rating?: number // 1-5
  feedback?: string
  createdAt: Date
  updatedAt: Date
  candidate: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    location?: string
    experience?: string
  }
  job: {
    title: string
    department: string
    location?: string
  }
}

// Hook para obtener entrevistas reales del backend
export function useInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    try {
      setLoading(true)
      const data = await api.get<BackendInterview[]>('/interviews')

      // Mapear los datos del backend al formato del frontend
      const mappedInterviews: Interview[] = (data || []).map((interview) => {
        // Combinar fecha y hora en un solo objeto Date
        const scheduledDate = new Date(interview.scheduledDate)
        const [hours, minutes] = interview.scheduledTime.split(':')
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        // Mapear tipos
        const typeMap: Record<string, 'phone' | 'video' | 'in-person' | 'technical'> = {
          'telefonica': 'phone',
          'virtual': 'video',
          'presencial': 'in-person',
          'phone': 'phone',
          'video': 'video',
          'in-person': 'in-person',
          'technical': 'technical'
        }

        // Mapear estados
        const statusMap: Record<string, 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled'> = {
          'programada': 'scheduled',
          'completada': 'completed',
          'cancelada': 'cancelled',
          'reprogramada': 'rescheduled',
          'scheduled': 'scheduled',
          'completed': 'completed',
          'cancelled': 'cancelled',
          'no-show': 'no-show',
          'rescheduled': 'rescheduled'
        }

        return {
          id: interview.id,
          applicationId: interview.applicationId,
          candidateId: interview.application?.candidate?.id || '',
          jobId: interview.application?.job?.id || '',
          scheduledAt: scheduledDate,
          duration: interview.durationMinutes || 60,
          type: typeMap[interview.type] || 'video',
          status: statusMap[interview.status] || 'scheduled',
          interviewerName: interview.interviewer ? `${interview.interviewer.firstName} ${interview.interviewer.lastName}` : interview.application?.job?.hiringManager,
          interviewerEmail: interview.interviewer?.email,
          meetingLink: interview.location,
          location: interview.location,
          notes: interview.notes,
          rating: interview.rating,
          feedback: interview.interviewerNotes,
          createdAt: new Date(interview.createdAt),
          updatedAt: new Date(interview.updatedAt),
          candidate: {
            firstName: interview.application?.candidate?.firstName || 'Candidato',
            lastName: interview.application?.candidate?.lastName || '',
            email: interview.application?.candidate?.email || '',
            phone: interview.application?.candidate?.phone,
            location: interview.application?.candidate?.location,
            experience: interview.application?.candidate?.experience
          },
          job: {
            title: interview.application?.job?.title || 'Puesto',
            department: interview.application?.job?.department || '',
            location: interview.application?.job?.location
          }
        }
      })

      setInterviews(mappedInterviews)
    } catch (error) {
      console.error('Error loading interviews:', error)
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  const updateInterviewStatus = async (interviewId: string, status: Interview['status'], notes?: string) => {
    setInterviews(prev =>
      prev.map(interview =>
        interview.id === interviewId
          ? { ...interview, status, notes: notes || interview.notes, updatedAt: new Date() }
          : interview
      )
    )
    return true
  }

  const addInterview = async (interviewData: Partial<Interview>) => {
    const newInterview: Interview = {
      id: `interview_${Date.now()}`,
      applicationId: interviewData.applicationId || '',
      candidateId: interviewData.candidateId || '',
      jobId: interviewData.jobId || '',
      scheduledAt: interviewData.scheduledAt || new Date(),
      duration: interviewData.duration || 60,
      type: interviewData.type || 'video',
      status: 'scheduled',
      interviewerName: interviewData.interviewerName,
      interviewerEmail: interviewData.interviewerEmail,
      meetingLink: interviewData.meetingLink,
      location: interviewData.location,
      createdAt: new Date(),
      updatedAt: new Date(),
      candidate: interviewData.candidate || { firstName: '', lastName: '', email: '' },
      job: interviewData.job || { title: '', department: '' }
    }

    setInterviews(prev => [...prev, newInterview])
    return true
  }

  const getInterviewsByDate = (date: Date) => {
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt)
      return interviewDate.toDateString() === date.toDateString()
    })
  }

  const getUpcomingInterviews = (days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt)
      return interviewDate >= now && interviewDate <= futureDate && interview.status === 'scheduled'
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  }

  const getTodayInterviews = () => {
    return getInterviewsByDate(new Date())
  }

  const getInterviewStats = () => {
    const total = interviews.length
    const scheduled = interviews.filter(i => i.status === 'scheduled').length
    const completed = interviews.filter(i => i.status === 'completed').length
    const cancelled = interviews.filter(i => i.status === 'cancelled').length
    const today = getTodayInterviews().length

    return { total, scheduled, completed, cancelled, today }
  }

  return {
    interviews,
    loading,
    updateInterviewStatus,
    addInterview,
    getInterviewsByDate,
    getUpcomingInterviews,
    getTodayInterviews,
    getInterviewStats,
    refetch: loadInterviews
  }
}