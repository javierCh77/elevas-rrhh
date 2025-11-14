'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { getErrorMessage } from '@/lib/types'

interface BackendCandidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dni?: string
  location?: string
  yearsOfExperience?: number
  skills?: string[]
  linkedinUrl?: string
  portfolioUrl?: string
  resumeUrl?: string
  status: 'active' | 'inactive' | 'blacklisted'
  source?: string
  createdAt: Date
  updatedAt: Date
  applications?: Array<{
    id: string
    status: string
    createdAt: Date
    job: {
      id: string
      title: string
      department: string
    }
  }>
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dni?: string
  location?: string
  experience?: string
  skills?: string[]
  linkedinUrl?: string
  portfolioUrl?: string
  resumeUrl?: string
  status: 'active' | 'inactive' | 'blacklisted'
  source?: string
  addedAt: Date
  lastUpdate: Date
  applications?: Array<{
    id: string
    jobId: string
    status: string
    appliedAt: Date
    jobTitle: string
    department: string
  }>
}

// Transform backend candidate to frontend format
const transformCandidate = (backendCandidate: BackendCandidate): Candidate => {
  return {
    id: backendCandidate.id,
    firstName: backendCandidate.firstName,
    lastName: backendCandidate.lastName,
    email: backendCandidate.email,
    phone: backendCandidate.phone,
    dni: backendCandidate.dni,
    location: backendCandidate.location,
    experience: backendCandidate.yearsOfExperience ? `${backendCandidate.yearsOfExperience} años` : undefined,
    skills: backendCandidate.skills,
    linkedinUrl: backendCandidate.linkedinUrl,
    portfolioUrl: backendCandidate.portfolioUrl,
    resumeUrl: backendCandidate.resumeUrl,
    status: backendCandidate.status,
    source: backendCandidate.source,
    addedAt: new Date(backendCandidate.createdAt),
    lastUpdate: new Date(backendCandidate.updatedAt),
    applications: backendCandidate.applications?.map(app => ({
      id: app.id,
      jobId: app.job?.id || '',
      status: app.status,
      appliedAt: new Date(app.createdAt),
      jobTitle: app.job?.title || 'Sin título',
      department: app.job?.department || 'Sin departamento'
    }))
  }
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<{candidates: BackendCandidate[]}>('/candidates?limit=1000')

      if (response.candidates) {
        const transformedCandidates = response.candidates.map(transformCandidate)
        setCandidates(transformedCandidates)
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching candidates:', err)
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateCandidateStatus = async (candidateId: string, status: 'active' | 'inactive' | 'blacklisted') => {
    try {
      await api.patch(`/candidates/${candidateId}`, { status })

      setCandidates(prev =>
        prev.map(candidate =>
          candidate.id === candidateId
            ? { ...candidate, status, lastUpdate: new Date() }
            : candidate
        )
      )
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating candidate status:', err)
      }
      throw new Error(errorMessage)
    }
  }

  const createCandidate = async (candidateData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    dni?: string
    location?: string
    skills?: string[]
    linkedinUrl?: string
    resumeFile?: File
    status?: 'active' | 'inactive' | 'blacklisted'
    source?: string
  }) => {
    try {
      // Por ahora, el backend no soporta upload de archivos
      // Enviamos solo los datos en JSON (sin el archivo)
      // TODO: Implementar endpoint de upload en el backend

      const { resumeFile, ...dataWithoutFile } = candidateData

      // Si hay archivo, mostrar advertencia al usuario
      if (resumeFile && process.env.NODE_ENV === 'development') {
        console.warn('El CV será guardado localmente pero no se subirá al servidor hasta que se implemente el endpoint de upload')
      }

      // Limpiar campos vacíos para evitar errores de validación en el backend
      const cleanedData = Object.fromEntries(
        Object.entries(dataWithoutFile).filter(([, value]) => {
          // Remover campos que sean string vacío, null o undefined
          if (value === '' || value === null || value === undefined) return false
          // Remover arrays vacíos
          if (Array.isArray(value) && value.length === 0) return false
          return true
        })
      )

      const response = await api.post<BackendCandidate>('/candidates', cleanedData)

      if (response) {
        const newCandidate = transformCandidate(response)
        setCandidates(prev => [newCandidate, ...prev])
        return newCandidate
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating candidate:', err)
      }
      throw new Error(errorMessage)
    }
  }

  const deleteCandidate = async (candidateId: string) => {
    try {
      await api.delete(`/candidates/${candidateId}`)

      setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId))
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting candidate:', err)
      }
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates,
    updateCandidateStatus,
    createCandidate,
    deleteCandidate
  }
}