'use client'

import { useState, useEffect } from 'react'

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
  isUrgent: boolean
  isRemote: boolean
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)

        // Intentar obtener jobs del backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
        const response = await fetch(`${backendUrl}/api/jobs`)

        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        } else {
          throw new Error('Error al obtener trabajos del backend')
        }
      } catch (err) {
        // Fallback a datos estáticos si no hay conexión con el backend
        const fallbackJobs: Job[] = [
          {
            id: '1',
            title: 'Consultor/a Senior en RRHH',
            department: 'Recursos Humanos',
            location: 'Ushuaia / Remoto',
            contractType: 'Tiempo completo',
            description: 'Buscamos un/a profesional con experiencia en consultoría de RRHH para liderar proyectos de transformación organizacional.',
            isUrgent: false,
            isRemote: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
          {
            id: '2',
            title: 'Especialista en People Analytics',
            department: 'Tecnología',
            location: 'Remoto',
            contractType: 'Tiempo completo',
            description: 'Únete a nuestro equipo para desarrollar soluciones de análisis de datos aplicadas a la gestión del talento.',
            isUrgent: false,
            isRemote: true,
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20'),
          },
          {
            id: '3',
            title: 'Desarrollador/a de Soluciones IA',
            department: 'Tecnología',
            location: 'Ushuaia / Remoto',
            contractType: 'Tiempo completo',
            description: 'Desarrollá herramientas de inteligencia artificial que revolutionen los procesos de RRHH.',
            isUrgent: true,
            isRemote: true,
            createdAt: new Date('2024-01-25'),
            updatedAt: new Date('2024-01-25'),
          }
        ]

        setJobs([])
        setError('No hay postulaciones abiertas en este momento')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return { jobs, loading, error }
}