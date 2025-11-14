'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { NotesModal } from './components/NotesModal'
import { InterviewScheduleModal } from './components/InterviewScheduleModal'
import { Plus, Search, MoreHorizontal, MapPin, Clock, DollarSign, Users, Target, CheckCircle, XCircle, Pause, Eye, ChevronLeft, ChevronRight, AlertTriangle, Loader2, FileText, Briefcase, Award, Calendar, Edit, Zap, Home, Building2, User, ChevronDown, ChevronUp, Download, MessageSquare, StickyNote, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent,} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useJobs, Job } from '@/hooks/useJobs'
import { useApplications } from '@/hooks/useApplications'
import { api } from '@/lib/api'
import { useNotification } from '@/hooks/useNotification'
import { formatDateAR, formatDateTimeAR } from '@/lib/date-utils'

const statusConfig = {
  active: {
    label: 'Activo',
    icon: CheckCircle,
    badgeStyle: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#16a34a',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 245, 0.95) 100%)',
      border: '1px solid rgba(207, 175, 110, 0.15)'
    }
  },
  paused: {
    label: 'Pausado',
    icon: Pause,
    badgeStyle: {
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      color: '#a16207',
      border: '1px solid rgba(234, 179, 8, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 245, 0.95) 100%)',
      border: '1px solid rgba(207, 175, 110, 0.15)'
    }
  },
  closed: {
    label: 'Cerrado',
    icon: XCircle,
    badgeStyle: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#4b5563',
      border: '1px solid rgba(107, 114, 128, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 245, 0.95) 100%)',
      border: '1px solid rgba(207, 175, 110, 0.15)'
    }
  },
  draft: {
    label: 'Borrador',
    icon: Eye,
    badgeStyle: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#2563eb',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 245, 0.95) 100%)',
      border: '1px solid rgba(207, 175, 110, 0.15)'
    }
  }
}

// Configuración de estados de aplicaciones
const applicationStatusConfig = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    badgeStyle: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200/50'
  },
  reviewed: {
    label: 'En Revisión',
    icon: Eye,
    badgeStyle: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200/50'
  },
  interview_scheduled: {
    label: 'Entrevista',
    icon: MessageSquare,
    badgeStyle: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200/50'
  },
  interviewed: {
    label: 'Entrevistado',
    icon: Users,
    badgeStyle: 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200/50'
  },
  offered: {
    label: 'Oferta',
    icon: Target,
    badgeStyle: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/50'
  },
  hired: {
    label: 'Contratado',
    icon: CheckCircle,
    badgeStyle: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200/50'
  },
  rejected: {
    label: 'Rechazado',
    icon: XCircle,
    badgeStyle: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200/50'
  },
  withdrawn: {
    label: 'Retirado',
    icon: AlertTriangle,
    badgeStyle: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200/50'
  }
}

export default function JobsPage() {
  const { jobs, loading, error, refetch, updateJobStatus } = useJobs()
  const { applications, updateApplicationStatus, addCandidateNote, getCandidateNotes } = useApplications()
  const notify = useNotification()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Estado para controlar los acordeones expandidos
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  // Estado para paginación de aplicaciones dentro de cada acordeón
  const [applicationPages, setApplicationPages] = useState<Record<string, number>>({})
  const applicationsPerPage = 10

  // Estado para modal de notas
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<unknown>(null)
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState('general')
  const [candidateNotes, setCandidateNotes] = useState<unknown[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const timelineContainerRef = React.useRef<HTMLDivElement>(null)

  // Estado para modal de análisis IA
  const [showAiAnalysisModal, setShowAiAnalysisModal] = useState(false)
  const [aiAnalysisData, setAiAnalysisData] = useState<unknown>(null)
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false)
  const [selectedApplicationForAi, setSelectedApplicationForAi] = useState<unknown>(null)
  const [selectedJobForAi, setSelectedJobForAi] = useState<unknown>(null)
  const [applicationsWithSummary, setApplicationsWithSummary] = useState<Set<string>>(new Set())

  // Estado para modal de programar entrevista
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false)
  const [selectedApplicationForInterview, setSelectedApplicationForInterview] = useState<unknown>(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [interviewType, setInterviewType] = useState('virtual')
  const [interviewLocation, setInterviewLocation] = useState('')
  const [interviewDuration, setInterviewDuration] = useState(60)
  const [interviewNotes, setInterviewNotes] = useState('')
  const [savingInterview, setSavingInterview] = useState(false)
  const [previousInterviews, setPreviousInterviews] = useState<unknown[]>([])
  const [loadingPreviousInterviews, setLoadingPreviousInterviews] = useState(false)

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Paginación
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1)

  // Función para calcular el porcentaje de coincidencia entre skills del candidato y del puesto
  const calculateMatchPercentage = (
    candidateSkills: string[] | undefined,
    jobSkills: string[] | undefined,
    applicationId?: string
  ): number => {
    // Si hay skills de ambos lados, calcular coincidencia real
    if (candidateSkills && candidateSkills.length > 0 && jobSkills && jobSkills.length > 0) {
      const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim())
      const normalizedCandidateSkills = candidateSkills.map(skill => skill.toLowerCase().trim())

      const matchingSkills = normalizedCandidateSkills.filter(skill =>
        normalizedJobSkills.includes(skill)
      )

      return Math.round((matchingSkills.length / normalizedJobSkills.length) * 100)
    }

    // DATOS SIMULADOS PARA TESTING - Generar porcentaje basado en el ID para consistencia
    if (applicationId) {
      const hash = applicationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const basePercentage = hash % 100

      // Ajustar distribución para que haya buenos candidatos
      if (basePercentage > 85) return 95 // Excelente
      if (basePercentage > 70) return 85 // Muy bueno
      if (basePercentage > 55) return 72 // Bueno
      if (basePercentage > 40) return 58 // Medio
      if (basePercentage > 25) return 43 // Bajo
      return 28 // Muy bajo
    }

    return 0
  }

  // Job action handlers
  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setShowDetailsModal(true)
  }

  // Handler para agregar nota
  const handleAddNote = async (candidate: unknown) => {
    setSelectedCandidate(candidate)
    setNoteContent('')
    setNoteType('general')
    setShowNoteModal(true)

    // Cargar notas existentes del candidato
    setLoadingNotes(true)
    const notes = await getCandidateNotes((candidate as Record<string, unknown>).email as string)
    setCandidateNotes((notes as unknown[]) || [])
    setLoadingNotes(false)
  }

  const handleSaveNote = async () => {
    if (!selectedCandidate || !noteContent.trim()) {
      notify.warning('Por favor escribe una nota')
      return
    }

    const candidate = selectedCandidate as Record<string, unknown>
    const success = await addCandidateNote(
      candidate.email as string,
      candidate.firstName as string,
      candidate.lastName as string,
      noteContent,
      noteType
    )

    if (success) {
      // Recargar notas para mostrar la nueva
      const notes = await getCandidateNotes(candidate.email as string)
      setCandidateNotes((notes as unknown[]) || [])

      // Limpiar formulario
      setNoteContent('')
      setNoteType('general')

      // Scroll automático suave a la última nota después de un pequeño delay
      setTimeout(() => {
        if (timelineContainerRef.current) {
          timelineContainerRef.current.scrollTo({
            top: timelineContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 300)

      notify.success('Nota agregada exitosamente')
    } else {
      notify.error('Error al agregar la nota')
    }
  }

  // Handler para analizar candidato con IA
  const handleAnalyzeWithAi = async (candidate: unknown, application: unknown, job: Job) => {
    const app = application as Record<string, unknown>
    const cand = candidate as Record<string, unknown>

    if (!app.resumeUrl) {
      notify.warning('Este candidato no tiene CV adjunto')
      return
    }

    setSelectedApplicationForAi(application)
    setSelectedJobForAi(job)
    setSelectedCandidate(candidate)
    setShowAiAnalysisModal(true)
    setLoadingAiAnalysis(true)
    setAiAnalysisData(null)

    try {
      const response = await api.analyzeCandidateSummary(
        cand.email as string,
        job.title,
        job.description,
        app.resumeUrl as string
      )

      if (response.summary) {
        setAiAnalysisData(response.summary)
      } else {
        throw new Error('No se pudo generar el análisis')
      }
    } catch (error) {
      console.error('Error analyzing with AI:', error)
      notify.error('Error al analizar con IA', 'Por favor intenta de nuevo')
      setShowAiAnalysisModal(false)
    } finally {
      setLoadingAiAnalysis(false)
    }
  }

  // Handler para guardar análisis IA
  const handleSaveAiSummary = async () => {
    if (!aiAnalysisData || !selectedApplicationForAi) {
      notify.warning('No hay análisis para guardar')
      return
    }

    const app = selectedApplicationForAi as Record<string, unknown>

    try {
      const response = await api.saveAiSummary(
        app.id as string,
        aiAnalysisData as { summary: string; analysis?: string; scores?: Record<string, number>; [key: string]: unknown }
      )

      if (response.success) {
        // Agregar al set de aplicaciones con resumen
        setApplicationsWithSummary(prev => new Set(prev).add(app.id as string))
        notify.success('Análisis guardado exitosamente', 'Ahora puedes descargarlo desde el botón de Acciones')
        setShowAiAnalysisModal(false)
      }
    } catch (error) {
      console.error('Error saving AI summary:', error)
      notify.error('Error al guardar el análisis', 'Por favor intenta de nuevo')
    }
  }

  // Handler para ver resumen guardado y descargarlo
  const handleDownloadSummary = async (application: unknown, job: Job) => {
    const app = application as Record<string, unknown>

    try {
      const response = await api.getAiSummary(app.id as string)

      if (response && response.success && response.data) {
        // Marcar que esta aplicación tiene resumen
        setApplicationsWithSummary(prev => new Set(prev).add(app.id as string))

        // Mostrar modal con el resumen
        setSelectedApplicationForAi(application)
        setSelectedJobForAi(job)
        setSelectedCandidate(app.candidate)
        setShowAiAnalysisModal(true)
        setLoadingAiAnalysis(false)

        // Mapear los datos de la base de datos al formato esperado por el modal
        const savedSummary = response.data as Record<string, unknown>
        setAiAnalysisData({
          globalMatch: savedSummary.globalMatch,
          experienceMatch: savedSummary.experienceMatch,
          educationMatch: savedSummary.educationMatch,
          skillsMatch: savedSummary.skillsMatch,
          affinityMatch: savedSummary.affinityMatch,
          experienceAnalysis: savedSummary.experienceAnalysis,
          educationAnalysis: savedSummary.educationAnalysis,
          skillsAnalysis: savedSummary.skillsAnalysis,
          affinityAnalysis: savedSummary.affinityAnalysis,
          synthesis: savedSummary.synthesis,
          recommendation: savedSummary.recommendation
        })
      } else {
        throw new Error('No se encontró resumen guardado')
      }
    } catch (error) {
      console.error('Error loading saved summary:', error)
      notify.info('No hay resumen guardado para este candidato', 'Primero debes generar el análisis con IA')
    }
  }

  // Handler para abrir modal de programar entrevista
  const handleScheduleInterview = async (application: unknown) => {
    setSelectedApplicationForInterview(application)
    setInterviewDate('')
    setInterviewTime('')
    setInterviewType('virtual')
    setInterviewLocation('')
    setInterviewDuration(60)
    setInterviewNotes('')
    setShowScheduleInterviewModal(true)

    // Cargar entrevistas previas del candidato
    setLoadingPreviousInterviews(true)
    try {
      const app = application as Record<string, unknown>
      const response = await api.get(`/interviews/by-application/${app.id}`)
      setPreviousInterviews((response as unknown[]) || [])
    } catch (error) {
      console.error('Error loading previous interviews:', error)
      setPreviousInterviews([])
    } finally {
      setLoadingPreviousInterviews(false)
    }
  }

  // Handler para guardar entrevista
  const handleSaveInterview = async () => {
    if (!selectedApplicationForInterview || !interviewDate || !interviewTime) {
      notify.warning('Por favor completa la fecha y hora de la entrevista')
      return
    }

    setSavingInterview(true)

    const app = selectedApplicationForInterview as Record<string, unknown>

    try {
      const response = await api.post('/interviews', {
        applicationId: app.id,
        scheduledDate: interviewDate,
        scheduledTime: interviewTime,
        type: interviewType,
        location: interviewLocation,
        durationMinutes: interviewDuration,
        notes: interviewNotes
      })

      if (response) {
        notify.success('Entrevista programada exitosamente')

        // Recargar el historial de entrevistas
        try {
          const updatedInterviews = await api.get(`/interviews/by-application/${app.id}`)
          setPreviousInterviews((updatedInterviews as unknown[]) || [])
        } catch (error) {
          console.error('Error reloading interviews:', error)
        }

        // Limpiar formulario
        setInterviewDate('')
        setInterviewTime('')
        setInterviewType('virtual')
        setInterviewLocation('')
        setInterviewDuration(60)
        setInterviewNotes('')

        // Recargar aplicaciones si es necesario
        refetch()
      }
    } catch (error) {
      console.error('Error scheduling interview:', error)
      notify.error('Error al programar la entrevista')
    } finally {
      setSavingInterview(false)
    }
  }

  const handlePauseJob = (job: Job) => {
    setSelectedJob(job)
    setShowPauseModal(true)
  }

  const handleCloseJob = (job: Job) => {
    setSelectedJob(job)
    setShowCloseModal(true)
  }

  const handleActivateJob = async (job: Job) => {
    setActionLoading(true)
    try {
      const success = await updateJobStatus(job.id, 'activate')
      if (success) {
        notify.success('Puesto activado exitosamente', `"${job.title}" está ahora activo`)
      } else {
        notify.error('Error al activar el puesto', 'Inténtalo de nuevo')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const confirmPauseJob = async () => {
    if (!selectedJob) return

    setActionLoading(true)
    try {
      const success = await updateJobStatus(selectedJob.id, 'pause')
      if (success) {
        notify.success('Puesto pausado exitosamente', `"${selectedJob.title}" está ahora pausado`)
        setShowPauseModal(false)
        setSelectedJob(null)
      } else {
        notify.error('Error al pausar el puesto', 'Inténtalo de nuevo')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const confirmCloseJob = async () => {
    if (!selectedJob) return

    setActionLoading(true)
    try {
      const success = await updateJobStatus(selectedJob.id, 'close')
      if (success) {
        notify.success('Puesto cerrado definitivamente', `"${selectedJob.title}" ha sido cerrado`)
        setShowCloseModal(false)
        setSelectedJob(null)
      } else {
        notify.error('Error al cerrar el puesto', 'Inténtalo de nuevo')
      }
    } finally{
      setActionLoading(false)
    }
  }

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#cfaf6e]" />
          <p className="text-gray-600">Cargando puestos de trabajo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} className="bg-[#cfaf6e] hover:bg-[#a37d43]">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    totalApplications: jobs.reduce((sum, job) => sum + job.applicationsCount, 0)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      {/* Main Container with proper padding */}
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
              Puestos de Trabajo
            </h1>
            <p className="text-sm sm:text-base text-amber-700/80">
              Gestiona vacantes y procesos de reclutamiento de manera eficiente
            </p>
          </div>
          <Link href="/dashboard/jobs/create">
            <Button className="w-fit transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
              <Plus className="mr-2 h-5 w-5" />
              Crear Puesto
            </Button>
          </Link>
        </div>

        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Puestos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Activos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-yellow-500 to-amber-500">
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pausados</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.paused}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-slate-500 to-gray-500">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Cerrados</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.closed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-violet-500 to-purple-500">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Aplicaciones</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

        {/* Filters Section - Mobile First */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-end">
            <div className="flex-1 lg:max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar puestos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
                <Input
                  placeholder="Escribir título, departamento..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    resetPage()
                  }}
                  className="pl-10 h-11 text-base transition-all duration-200 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 sm:max-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <Select value={selectedStatus} onValueChange={(value) => {
                  setSelectedStatus(value)
                  resetPage()
                }}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 sm:max-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                <Select value={selectedDepartment} onValueChange={(value) => {
                  setSelectedDepartment(value)
                  resetPage()
                }}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Producto">Producto</SelectItem>
                    <SelectItem value="Diseño">Diseño</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </div>
      </Card>

        {/* Jobs List */}
        <div className="grid gap-4">
          {paginatedJobs.map((job) => {
          const statusInfo = statusConfig[job.status as keyof typeof statusConfig]
          const StatusIcon = statusInfo.icon

          return (
            <Card key={job.id} className="transition-all duration-300 hover:shadow-lg cursor-pointer" style={statusInfo.cardStyle}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold" style={{color: '#1a1a1a'}}>{job.title}</h3>
                      <Badge className="flex items-center space-x-1" style={statusInfo.badgeStyle}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusInfo.label}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" style={{color: '#666666'}} />
                        <span className="text-sm" style={{color: '#666666'}}>{job.location}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" style={{color: '#666666'}} />
                          <span className="text-sm" style={{color: '#666666'}}>{job.salaryRange}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" style={{color: '#666666'}} />
                        <span className="text-sm" style={{color: '#666666'}}>{job.applicationsCount} aplicaciones</span>
                      </div>
                      {job.deadline && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" style={{color: '#666666'}} />
                          <span className="text-sm" style={{color: '#666666'}}>
                            Hasta {formatDateAR(job.deadline)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" style={{color: '#666666'}} />
                        <span className="text-sm" style={{color: '#666666'}}>{job.viewsCount} vistas</span>
                      </div>
                    </div>

                    <p className="text-sm mb-3" style={{color: '#666666'}}>{job.description}</p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" style={{
                            backgroundColor: 'rgba(207, 175, 110, 0.1)',
                            color: '#a37d43'
                          }}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Botón para expandir/colapsar postulaciones */}
                    <div className="mt-4 pt-4 border-t border-amber-200/30">
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                        className="w-full justify-between hover:bg-amber-50/50 text-gray-700 font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Ver Postulaciones ({job.applicationsCount})
                        </span>
                        {expandedJobId === job.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Acordeón de Postulaciones */}
                    {expandedJobId === job.id && (
                      <div className="mt-4 -mx-6 px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border border-amber-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {(() => {
                          // Filtrar aplicaciones por este puesto
                          const jobApplications = applications.filter(app => app.jobId === job.id)

                          // Calcular % coincidencia para cada aplicación y ordenar de mayor a menor
                          const applicationsWithMatch = jobApplications.map(app => ({
                            ...app,
                            matchPercentage: calculateMatchPercentage(app.candidate?.skills, job.skills, app.id)
                          })).sort((a, b) => b.matchPercentage - a.matchPercentage)

                          // Stats de aplicaciones
                          const appStats = {
                            total: applicationsWithMatch.length,
                            pending: applicationsWithMatch.filter(app => app.status === 'pending').length,
                            reviewed: applicationsWithMatch.filter(app => app.status === 'reviewed').length,
                            interview: applicationsWithMatch.filter(app => app.status === 'interview_scheduled').length,
                            interviewed: applicationsWithMatch.filter(app => app.status === 'interviewed').length,
                            offered: applicationsWithMatch.filter(app => app.status === 'offered').length,
                            hired: applicationsWithMatch.filter(app => app.status === 'hired').length,
                            rejected: applicationsWithMatch.filter(app => app.status === 'rejected').length,
                          }

                          // Paginación
                          const currentAppPage = applicationPages[job.id] || 1
                          const appStartIndex = (currentAppPage - 1) * applicationsPerPage
                          const appEndIndex = appStartIndex + applicationsPerPage
                          const paginatedApps = applicationsWithMatch.slice(appStartIndex, appEndIndex)
                          const totalAppPages = Math.ceil(applicationsWithMatch.length / applicationsPerPage)

                          return (
                            <>
                              {/* Mini Stats Header */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-3 bg-gradient-to-r from-amber-50/60 via-orange-50/50 to-amber-50/40 rounded-xl border border-amber-200/40 shadow-[0_2px_15px_rgba(207,175,110,0.1)] backdrop-blur-sm hover:shadow-[0_4px_20px_rgba(207,175,110,0.15)] transition-shadow duration-300">
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Total</p>
                                  <p className="text-lg font-bold text-gray-800">{appStats.total}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Pendientes</p>
                                  <p className="text-lg font-bold text-yellow-700">{appStats.pending}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Revisión</p>
                                  <p className="text-lg font-bold text-blue-700">{appStats.reviewed}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Entrevistas</p>
                                  <p className="text-lg font-bold text-purple-700">{appStats.interview}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Entrevistados</p>
                                  <p className="text-lg font-bold text-indigo-700">{appStats.interviewed}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Ofertas</p>
                                  <p className="text-lg font-bold text-green-700">{appStats.offered}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Contratados</p>
                                  <p className="text-lg font-bold text-emerald-700">{appStats.hired}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 font-medium">Rechazados</p>
                                  <p className="text-lg font-bold text-red-700">{appStats.rejected}</p>
                                </div>
                              </div>

                              {/* Tabla de Postulaciones */}
                              {jobApplications.length > 0 ? (
                                <div className="border border-amber-200/40 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(207,175,110,0.08)] backdrop-blur-sm bg-white/60">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gradient-to-r from-amber-100/80 via-amber-50/60 to-orange-50/60 hover:from-amber-100/90 hover:via-amber-50/70 hover:to-orange-50/70 border-b-2 border-amber-200/50">
                                        <TableHead className="text-amber-900 font-bold w-16 text-center px-4">#</TableHead>
                                        <TableHead className="text-amber-900 font-bold px-4">Candidato</TableHead>
                                        <TableHead className="text-amber-900 font-bold w-[180px] px-4">Estado</TableHead>
                                        <TableHead className="text-amber-900 font-bold w-[160px] px-4">% Coincidencia</TableHead>
                                        <TableHead className="text-amber-900 font-bold w-24 px-4">Fecha</TableHead>
                                        <TableHead className="text-amber-900 font-bold w-[180px] text-right px-4">Acciones</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {paginatedApps.map((application, index) => {
                                        const appStatusInfo = applicationStatusConfig[application.status as keyof typeof applicationStatusConfig]
                                        const matchPercentage = application.matchPercentage

                                        // Calcular posición global en la lista ordenada
                                        const globalIndex = appStartIndex + index
                                        const isTop5 = globalIndex < 5

                                        // Determinar color del badge según el porcentaje
                                        const getMatchColor = (percentage: number) => {
                                          if (percentage >= 80) return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200/50'
                                          if (percentage >= 60) return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200/50'
                                          if (percentage >= 40) return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200/50'
                                          if (percentage >= 20) return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200/50'
                                          return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200/50'
                                        }

                                        return (
                                          <TableRow
                                            key={application.id}
                                            className={cn(
                                              "hover:bg-amber-50/40 transition-all duration-300 hover:shadow-sm",
                                              isTop5 && "bg-gradient-to-br from-teal-50/50 via-emerald-50/40 to-amber-50/30 border-l-4 border-l-teal-400/60 shadow-md hover:shadow-lg"
                                            )}
                                          >
                                            {/* Columna de Ranking */}
                                            <TableCell className="text-center px-4 w-16">
                                              {isTop5 ? (
                                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold shadow-lg hover:shadow-xl text-sm px-3 py-1 transform hover:scale-110 transition-all duration-200 cursor-default">
                                                  {globalIndex + 1}
                                                </Badge>
                                              ) : (
                                                <span className="text-gray-400 text-sm font-medium transition-colors duration-200 hover:text-gray-600">{globalIndex + 1}</span>
                                              )}
                                            </TableCell>

                                            {/* Columna de Candidato */}
                                            <TableCell className="px-4">
                                              <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                                  <span className="text-white font-medium text-xs">
                                                    {application.candidate?.firstName?.charAt(0) || '?'}
                                                    {application.candidate?.lastName?.charAt(0) || '?'}
                                                  </span>
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-medium text-sm text-gray-800 truncate">
                                                    {application.candidate?.firstName || 'Sin'} {application.candidate?.lastName || 'nombre'}
                                                  </p>
                                                  <p className="text-xs text-gray-500 truncate">{application.candidate?.email || 'Sin email'}</p>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="px-4 w-[180px]">
                                              <Select
                                                value={application.status}
                                                onValueChange={async (newStatus) => {
                                                  const success = await updateApplicationStatus(application.id, newStatus)
                                                  if (!success) {
                                                    notify.error('Error al actualizar el estado de la postulación')
                                                  } else {
                                                    notify.success('Estado actualizado exitosamente')
                                                  }
                                                }}
                                              >
                                                <SelectTrigger className={cn(
                                                  "w-[140px] h-8 text-xs border-0 font-medium transition-all duration-200",
                                                  appStatusInfo?.badgeStyle
                                                )}>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="pending">
                                                    <div className="flex items-center gap-2">
                                                      <Clock className="h-3.5 w-3.5 text-yellow-600" />
                                                      <span>Pendiente</span>
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="reviewed">
                                                    <div className="flex items-center gap-2">
                                                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                                                      <span>En Revisión</span>
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="interview_scheduled">
                                                    <div className="flex items-center gap-2">
                                                      <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                                                      <span>Entrevista Programada</span>
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="interviewed">
                                                    <div className="flex items-center gap-2">
                                                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                                                      <span>Entrevistado</span>
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="offered">
                                                    <div className="flex items-center gap-2">
                                                      <Target className="h-3.5 w-3.5 text-green-600" />
                                                      <span>Oferta Realizada</span>
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="hired">
                                                    <div className="flex items-center gap-2">
                                                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                      <span>Contratado</span>
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="rejected">
                                                    <div className="flex items-center gap-2">
                                                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                      <span>Rechazado</span>
                                                    </div>
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </TableCell>
                                            <TableCell className="px-4 w-[160px]">
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <Badge className={cn("text-xs font-semibold", getMatchColor(matchPercentage))}>
                                                    {matchPercentage}%
                                                  </Badge>
                                                </div>
                                                {/* Mini barra de progreso */}
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                  <div
                                                    className={cn(
                                                      "h-full rounded-full transition-all duration-300",
                                                      matchPercentage >= 80 ? "bg-gradient-to-r from-emerald-500 to-green-500" :
                                                      matchPercentage >= 60 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                                                      matchPercentage >= 40 ? "bg-gradient-to-r from-yellow-500 to-amber-500" :
                                                      matchPercentage >= 20 ? "bg-gradient-to-r from-orange-500 to-amber-500" :
                                                      "bg-gradient-to-r from-red-500 to-rose-500"
                                                    )}
                                                    style={{ width: `${matchPercentage}%` }}
                                                  />
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 px-4 w-24">
                                              {formatDateAR(application.appliedAt)}
                                            </TableCell>
                                            <TableCell className="px-4 w-[180px]">
                                              <div className="flex items-center justify-end gap-1">
                                                {/* Botón Agregar Nota */}
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => handleAddNote(application.candidate)}
                                                  className="h-8 w-8 hover:bg-blue-100/80 text-blue-600 hover:text-blue-900 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 rounded-lg"
                                                  title="Agregar nota del candidato"
                                                >
                                                  <StickyNote className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
                                                </Button>

                                                {/* Botón Programar Entrevista - Solo visible cuando estado es interview_scheduled */}
                                                {application.status === 'interview_scheduled' && (
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleScheduleInterview(application)}
                                                    className="h-8 w-8 hover:bg-green-100/80 text-green-600 hover:text-green-900 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 rounded-lg"
                                                    title="Programar entrevista"
                                                  >
                                                    <Calendar className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                                  </Button>
                                                )}

                                                {/* Botón Analizar con IA */}
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => handleAnalyzeWithAi(application.candidate, application, job)}
                                                  className="h-8 w-8 hover:bg-gradient-to-br hover:from-purple-100/80 hover:to-pink-100/80 text-purple-600 hover:text-purple-900 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 rounded-lg group"
                                                  title="Analizar candidato con IA"
                                                >
                                                  <Sparkles className="h-4 w-4 transition-all duration-200 group-hover:rotate-12 group-hover:scale-110" />
                                                </Button>

                                                {/* Botón Ver CV */}
                                                {application.resumeUrl && (
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(`http://localhost:3000${application.resumeUrl}`, '_blank')}
                                                    className="h-8 w-8 hover:bg-amber-100/80 text-amber-700 hover:text-amber-900 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 rounded-lg"
                                                    title="Ver CV del candidato"
                                                  >
                                                    <Eye className="h-4 w-4 transition-transform duration-200 hover:-translate-y-0.5" />
                                                  </Button>
                                                )}

                                                {/* Botón Ver Resumen IA Guardado - AL FINAL */}
                                                {(() => {
                                                  const hasAiSummary = applicationsWithSummary.has(application.id)

                                                  return (
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => {
                                                        if (hasAiSummary) {
                                                          handleDownloadSummary(application, job)
                                                        } else {
                                                          // Intentar cargar por si existe pero no está en el set
                                                          handleDownloadSummary(application, job)
                                                        }
                                                      }}
                                                      className={cn(
                                                        "h-8 w-8 transition-all duration-200 rounded-lg",
                                                        hasAiSummary
                                                          ? "hover:bg-green-100/80 text-green-600 hover:text-green-900 hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                                                          : "text-gray-300 hover:text-gray-400 cursor-pointer opacity-60 hover:opacity-80"
                                                      )}
                                                      title={hasAiSummary ? "Ver/Descargar resumen de IA guardado" : "Ver resumen de IA (si existe)"}
                                                    >
                                                      <Download className={cn(
                                                        "h-4 w-4 transition-transform duration-200",
                                                        hasAiSummary && "group-hover:-translate-y-0.5"
                                                      )} />
                                                    </Button>
                                                  )
                                                })()}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>

                                  {/* Paginación de aplicaciones */}
                                  {totalAppPages > 1 && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50/50 border-t border-amber-200/30">
                                      <p className="text-xs text-gray-600">
                                        {appStartIndex + 1}-{Math.min(appEndIndex, jobApplications.length)} de {jobApplications.length}
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => setApplicationPages({ ...applicationPages, [job.id]: currentAppPage - 1 })}
                                          disabled={currentAppPage === 1}
                                          className="h-7 w-7 text-amber-700 border-amber-200/50"
                                        >
                                          <ChevronLeft className="h-3.5 w-3.5" />
                                        </Button>
                                        <span className="text-xs text-gray-600 px-2">
                                          {currentAppPage} / {totalAppPages}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => setApplicationPages({ ...applicationPages, [job.id]: currentAppPage + 1 })}
                                          disabled={currentAppPage === totalAppPages}
                                          className="h-7 w-7 text-amber-700 border-amber-200/50"
                                        >
                                          <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">No hay postulaciones para este puesto</p>
                                </div>
                              )}
                            </>
                          )
                        })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="transition-all duration-300 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(job)}
                        className="cursor-pointer"
                      >
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/jobs/${job.id}/edit`} className="cursor-pointer">
                          Editar puesto
                        </Link>
                      </DropdownMenuItem>
                      {job.status === 'paused' ? (
                        <DropdownMenuItem
                          onClick={() => handleActivateJob(job)}
                          className="cursor-pointer text-green-600"
                          disabled={actionLoading}
                        >
                          Activar puesto
                        </DropdownMenuItem>
                      ) : job.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => handlePauseJob(job)}
                          className="cursor-pointer"
                        >
                          Pausar puesto
                        </DropdownMenuItem>
                      ) : null}
                      {job.status !== 'closed' && (
                        <DropdownMenuItem
                          onClick={() => handleCloseJob(job)}
                          className="text-red-600 cursor-pointer"
                        >
                          Cerrar puesto
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredJobs.length)} de {filteredJobs.length} resultados
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show only relevant pages (current page and surrounding pages)
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 p-0 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600'
                            : 'text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300'
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  }
                  // Show ellipsis for gaps
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 text-gray-400">...</span>
                  }
                  return null
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 mb-4" style={{color: '#cfaf6e'}} />
            <h3 className="text-lg font-medium mb-2" style={{color: '#1a1a1a'}}>No se encontraron puestos</h3>
            <p style={{color: '#666666'}}>Intenta ajustar los filtros o crear un nuevo puesto.</p>
          </div>
        )}

        {/* Pause Job Modal */}
        <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
          <DialogContent className="max-w-md" style={{
            background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(207, 175, 110, 0.2)',
            borderRadius: '16px'
          }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3" style={{color: '#1a1a1a'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.2)'
                }}>
                  <Pause className="h-5 w-5 text-yellow-600" />
                </div>
                Pausar Puesto
              </DialogTitle>
              <DialogDescription style={{color: '#666666'}}>
                ¿Estás seguro de que quieres pausar este puesto de trabajo?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(234, 179, 8, 0.05)',
                border: '1px solid rgba(234, 179, 8, 0.2)'
              }}>
                <h4 className="font-semibold text-gray-900">{selectedJob?.title}</h4>
                <p className="text-sm text-gray-600">{selectedJob?.department}</p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>• El puesto dejará de recibir nuevas aplicaciones</p>
                <p>• Podrás reactivarlo en cualquier momento</p>
                <p>• Las aplicaciones existentes se mantendrán</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPauseModal(false)}
                  className="w-full sm:w-auto"
                  style={{
                    borderColor: 'rgba(207, 175, 110, 0.3)',
                    color: '#666666'
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmPauseJob}
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: '#eab308',
                    color: 'white',
                    borderColor: '#eab308'
                  }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pausando...
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar Puesto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Close Job Modal */}
        <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
          <DialogContent className="max-w-md" style={{
            background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px'
          }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3" style={{color: '#1a1a1a'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                Cerrar Puesto
              </DialogTitle>
              <DialogDescription style={{color: '#666666'}}>
                ¿Estás seguro de que quieres cerrar definitivamente este puesto?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <h4 className="font-semibold text-gray-900">{selectedJob?.title}</h4>
                <p className="text-sm text-gray-600">{selectedJob?.department}</p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-red-700">⚠️ Esta acción es irreversible:</p>
                <p>• El puesto se cerrará definitivamente</p>
                <p>• No se podrán recibir más aplicaciones</p>
                <p>• El historial se mantendrá solo para consulta</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCloseModal(false)}
                  className="w-full sm:w-auto"
                  style={{
                    borderColor: 'rgba(207, 175, 110, 0.3)',
                    color: '#666666'
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmCloseJob}
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderColor: '#dc2626'
                  }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cerrando...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cerrar Definitivamente
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Job Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl text-gray-800">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Target className="h-5 w-5 text-white" />
                </div>
                {selectedJob?.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Información completa del puesto de trabajo
              </DialogDescription>
            </DialogHeader>

            {selectedJob && (
              <div className="space-y-6 mt-4">
                {/* Status Badge and Urgency */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Badge className="flex items-center space-x-1" style={{
                      backgroundColor: statusConfig[selectedJob.status as keyof typeof statusConfig].badgeStyle.backgroundColor,
                      color: statusConfig[selectedJob.status as keyof typeof statusConfig].badgeStyle.color,
                      border: statusConfig[selectedJob.status as keyof typeof statusConfig].badgeStyle.border,
                      fontSize: '14px',
                      padding: '6px 12px'
                    }}>
                      {React.createElement(statusConfig[selectedJob.status as keyof typeof statusConfig].icon, {
                        className: "h-4 w-4 mr-1"
                      })}
                      {statusConfig[selectedJob.status as keyof typeof statusConfig].label}
                    </Badge>
                    {selectedJob.isUrgent && (
                      <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200/50 shadow-sm">
                        <Zap className="h-3 w-3 mr-1" />
                        Urgente
                      </Badge>
                    )}
                    {selectedJob.isRemote && (
                      <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200/50 shadow-sm">
                        <Home className="h-3 w-3 mr-1" />
                        Remoto
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Información Básica - Grid completa */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-amber-800 text-sm uppercase tracking-wide border-b border-amber-200/50 pb-2">Ubicación y Modalidad</h5>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Ubicación</p>
                        <p className="font-medium text-sm">{selectedJob.location || 'No especificada'}</p>
                      </div>
                    </div>

                    {selectedJob.modality && (
                      <div className="flex items-center space-x-3">
                        <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Modalidad</p>
                          <p className="font-medium text-sm">{selectedJob.modality}</p>
                        </div>
                      </div>
                    )}

                    {selectedJob.contractType && (
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Tipo de Contrato</p>
                          <p className="font-medium text-sm">{selectedJob.contractType}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-amber-800 text-sm uppercase tracking-wide border-b border-amber-200/50 pb-2">Información Organizacional</h5>

                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Departamento</p>
                        <p className="font-medium text-sm">{selectedJob.department}</p>
                      </div>
                    </div>

                    {selectedJob.createdBy && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Creado por</p>
                          <p className="font-medium text-sm">
                            {selectedJob.createdBy.firstName} {selectedJob.createdBy.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{selectedJob.createdBy.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-amber-800 text-sm uppercase tracking-wide border-b border-amber-200/50 pb-2">Compensación y Métricas</h5>

                    {(selectedJob.salaryMin || selectedJob.salaryMax || selectedJob.salaryRange) && (
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Salario</p>
                          <p className="font-medium text-sm">
                            {selectedJob.salaryRange ||
                             (selectedJob.salaryMin && selectedJob.salaryMax
                               ? `${selectedJob.salaryMin}€ - ${selectedJob.salaryMax}€`
                               : selectedJob.salaryMin
                                 ? `Desde ${selectedJob.salaryMin}€`
                                 : selectedJob.salaryMax
                                   ? `Hasta ${selectedJob.salaryMax}€`
                                   : 'No especificado'
                             )}
                          </p>
                          {selectedJob.salaryCurrency && selectedJob.salaryCurrency !== 'EUR' && (
                            <p className="text-xs text-gray-400">Moneda: {selectedJob.salaryCurrency}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Aplicaciones</p>
                        <p className="font-medium text-sm">{selectedJob.applicationsCount}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Eye className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Vistas</p>
                        <p className="font-medium text-sm">{selectedJob.viewsCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                    Descripción
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-amber-50/50 p-4 rounded-lg border border-amber-100/50">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Skills */}
                {selectedJob.skills && Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm">
                        <Target className="h-3 w-3 text-white" />
                      </div>
                      Habilidades Requeridas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200/50 shadow-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements - Como String */}
                {selectedJob.requirements && selectedJob.requirements.trim() && (
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 shadow-sm">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      Requisitos
                    </h4>
                    <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100/50">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedJob.requirements}
                      </div>
                    </div>
                  </div>
                )}

                {/* Responsibilities - Como String */}
                {selectedJob.responsibilities && selectedJob.responsibilities.trim() && (
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-500 shadow-sm">
                        <Briefcase className="h-3 w-3 text-white" />
                      </div>
                      Responsabilidades
                    </h4>
                    <div className="bg-violet-50/50 p-4 rounded-lg border border-violet-100/50">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedJob.responsibilities}
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits - Como String */}
                {selectedJob.benefits && selectedJob.benefits.trim() && (
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm">
                        <Award className="h-3 w-3 text-white" />
                      </div>
                      Beneficios
                    </h4>
                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedJob.benefits}
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Info Ampliado */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-amber-200/50">
                  <div className="text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                    <p className="text-xs text-gray-500">Fecha de Creación</p>
                    <p className="font-medium text-sm">{selectedJob.createdAt ? formatDateTimeAR(selectedJob.createdAt) : 'N/A'}</p>
                  </div>

                  <div className="text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                    <p className="text-xs text-gray-500">Última Actualización</p>
                    <p className="font-medium text-sm">{selectedJob.updatedAt ? formatDateTimeAR(selectedJob.updatedAt) : 'N/A'}</p>
                  </div>

                  {selectedJob.deadline ? (
                    <div className="text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-red-500" />
                      <p className="text-xs text-gray-500">Fecha Límite</p>
                      <p className="font-medium text-sm text-red-600">{formatDateAR(selectedJob.deadline)}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Fecha Límite</p>
                      <p className="font-medium text-sm text-gray-400">Sin límite</p>
                    </div>
                  )}

                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs text-gray-500">Candidatos</p>
                    <p className="font-medium text-sm text-blue-600">{selectedJob.applicationsCount}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-amber-200/50">
                  <Link href={`/dashboard/jobs/${selectedJob.id}/applications`} className="flex-1">
                    <Button variant="outline" className="w-full justify-center text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300">
                      <Users className="h-4 w-4 mr-2" />
                      Ver Aplicaciones
                    </Button>
                  </Link>
                  <Link href={`/dashboard/jobs/${selectedJob.id}/edit`} className="flex-1">
                    <Button className="w-full justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Puesto
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Timeline de Notas */}
        <NotesModal
          open={showNoteModal}
          onOpenChange={setShowNoteModal}
          candidate={selectedCandidate as { firstName: string; lastName: string; email: string } | null}
          notes={candidateNotes as Array<{ id: string; type: string; content: string; createdAt: string; createdBy?: { firstName: string; lastName: string; role?: string } }>}
          loadingNotes={loadingNotes}
          noteType={noteType}
          noteContent={noteContent}
          onNoteTypeChange={setNoteType}
          onNoteContentChange={setNoteContent}
          onSaveNote={handleSaveNote}
          formatDateTimeAR={formatDateTimeAR}
        />

        {/* Modal de Análisis IA - Premium */}
        <Dialog open={showAiAnalysisModal} onOpenChange={setShowAiAnalysisModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-purple-50/95 via-pink-50/90 to-violet-50/95 backdrop-blur-xl border-purple-200/40 shadow-[0_20px_60px_rgba(168,85,247,0.25)]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-purple-800 bg-clip-text text-transparent">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 ring-2 ring-purple-200/50 ring-offset-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Análisis IA del Candidato
              </DialogTitle>
              <DialogDescription className="text-purple-700/90 font-medium">
                {selectedCandidate ? `${(selectedCandidate as Record<string, unknown>).firstName} ${(selectedCandidate as Record<string, unknown>).lastName} - ${(selectedJobForAi as Record<string, unknown> | null)?.title}` : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-3 px-1 scrollbar-thin scrollbar-thumb-purple-300/50 scrollbar-track-transparent scroll-smooth">
              {loadingAiAnalysis ? (
                <div className="flex items-center justify-center py-20 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200/40">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-sm text-purple-700 font-semibold mb-2">Analizando CV con IA...</p>
                    <p className="text-xs text-purple-600/70">Esto puede tomar unos segundos</p>
                  </div>
                </div>
              ) : aiAnalysisData ? (
                <>
                  {/* Resumen General */}
                  <div className="bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-md border border-purple-200/60 rounded-xl p-4 shadow-md">
                    <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Resumen General
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-purple-100/50 rounded-lg">
                        <p className="text-xs text-purple-700 mb-1">Coincidencia Global</p>
                        <p className="text-2xl font-bold text-purple-900">{String((aiAnalysisData as Record<string, unknown>).globalMatch)}%</p>
                      </div>
                      <div className="text-center p-2 bg-blue-100/50 rounded-lg">
                        <p className="text-xs text-blue-700 mb-1">Experiencia</p>
                        <p className="text-2xl font-bold text-blue-900">{String((aiAnalysisData as Record<string, unknown>).experienceMatch)}%</p>
                      </div>
                      <div className="text-center p-2 bg-green-100/50 rounded-lg">
                        <p className="text-xs text-green-700 mb-1">Educación</p>
                        <p className="text-2xl font-bold text-green-900">{String((aiAnalysisData as Record<string, unknown>).educationMatch)}%</p>
                      </div>
                      <div className="text-center p-2 bg-amber-100/50 rounded-lg">
                        <p className="text-xs text-amber-700 mb-1">Competencias</p>
                        <p className="text-2xl font-bold text-amber-900">{String((aiAnalysisData as Record<string, unknown>).skillsMatch)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Experiencia Laboral */}
                  {(aiAnalysisData as Record<string, unknown>).experienceAnalysis && (
                    <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/70 backdrop-blur-md border border-blue-200/60 rounded-xl p-3.5 shadow-md">
                      <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Experiencia Laboral ({String(((aiAnalysisData as Record<string, unknown>).experienceAnalysis as Record<string, unknown>).match)}%)
                      </h3>
                      <p className="text-xs text-blue-800 mb-2">{String(((aiAnalysisData as Record<string, unknown>).experienceAnalysis as Record<string, unknown>).comment)}</p>
                      {(((aiAnalysisData as Record<string, unknown>).experienceAnalysis as Record<string, unknown>).relevant as unknown[] | undefined)?.map((exp: unknown, idx: number) => (
                        <div key={idx} className="text-xs bg-white/60 p-2 rounded mb-1">
                          <p className="font-semibold text-blue-900">{String((exp as Record<string, unknown>).company)} ({String((exp as Record<string, unknown>).period)})</p>
                          <p className="text-blue-700">{String((exp as Record<string, unknown>).role)} - {String((exp as Record<string, unknown>).relevance)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Educación */}
                  {(aiAnalysisData as Record<string, unknown>).educationAnalysis && (
                    <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/70 backdrop-blur-md border border-green-200/60 rounded-xl p-3.5 shadow-md">
                      <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Educación ({String(((aiAnalysisData as Record<string, unknown>).educationAnalysis as Record<string, unknown>).match)}%)
                      </h3>
                      <p className="text-xs text-green-800 mb-2">{String(((aiAnalysisData as Record<string, unknown>).educationAnalysis as Record<string, unknown>).comment)}</p>
                      <div className="flex flex-wrap gap-1">
                        {(((aiAnalysisData as Record<string, unknown>).educationAnalysis as Record<string, unknown>).degrees as string[] | undefined)?.map((degree: string, idx: number) => (
                          <Badge key={idx} className="text-xs bg-green-100 text-green-800">{degree}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competencias */}
                  {(aiAnalysisData as Record<string, unknown>).skillsAnalysis && (
                    <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/70 backdrop-blur-md border border-amber-200/60 rounded-xl p-3.5 shadow-md">
                      <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Competencias y Habilidades ({String(((aiAnalysisData as Record<string, unknown>).skillsAnalysis as Record<string, unknown>).match)}%)
                      </h3>
                      <p className="text-xs text-amber-800 mb-2">{String(((aiAnalysisData as Record<string, unknown>).skillsAnalysis as Record<string, unknown>).comment)}</p>
                      <div className="flex flex-wrap gap-1">
                        {(((aiAnalysisData as Record<string, unknown>).skillsAnalysis as Record<string, unknown>).cvSkills as string[] | undefined)?.map((skill: string, idx: number) => (
                          <Badge key={idx} className="text-xs bg-amber-100 text-amber-800">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recomendación */}
                  {(aiAnalysisData as Record<string, unknown>).recommendation && (
                    <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/70 backdrop-blur-md border border-purple-200/60 rounded-xl p-3.5 shadow-md">
                      <h3 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Recomendación Final
                      </h3>
                      <p className="text-xs text-purple-800">{String((aiAnalysisData as Record<string, unknown>).recommendation)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200/40">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                  <p className="text-sm text-gray-700">No se pudo generar el análisis</p>
                </div>
              )}
            </div>

            <div className="border-t border-purple-200/50 pt-4 flex justify-between items-center bg-gradient-to-r from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
              <Button
                variant="outline"
                onClick={() => setShowAiAnalysisModal(false)}
                className="border-purple-300/60 text-purple-800 hover:bg-purple-100/80 hover:border-purple-400 font-semibold shadow-sm hover:shadow-md transition-all duration-200 px-6"
              >
                Cerrar
              </Button>

              {aiAnalysisData && !loadingAiAnalysis ? (
                <div className="flex gap-3">
                  {/* Mostrar botón "Guardar" solo si NO está guardado aún */}
                  {selectedApplicationForAi && !applicationsWithSummary.has((selectedApplicationForAi as Record<string, unknown>).id as string) ? (
                    <Button
                      onClick={handleSaveAiSummary}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 px-6"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Guardar Análisis
                    </Button>
                  ) : null}

                  {/* Mostrar botón "Descargar PDF" si YA está guardado */}
                  {selectedApplicationForAi && applicationsWithSummary.has((selectedApplicationForAi as Record<string, unknown>).id as string) ? (
                    <Button
                      onClick={() => {
                        const url = `http://localhost:3000/api/applications/${(selectedApplicationForAi as Record<string, unknown>).id}/ai-summary/download-pdf`
                        window.open(url, '_blank')
                      }}
                      className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 px-6"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Programar Entrevista */}
        <InterviewScheduleModal
          open={showScheduleInterviewModal}
          onOpenChange={setShowScheduleInterviewModal}
          application={selectedApplicationForInterview as { id: string; candidate?: { firstName: string; lastName: string } } | null}
          previousInterviews={previousInterviews as Array<{ id: string; scheduledDate: string; scheduledTime: string; type: string; status: string; location?: string; notes?: string }>}
          loadingPreviousInterviews={loadingPreviousInterviews}
          interviewDate={interviewDate}
          interviewTime={interviewTime}
          interviewType={interviewType}
          interviewLocation={interviewLocation}
          interviewDuration={interviewDuration}
          interviewNotes={interviewNotes}
          savingInterview={savingInterview}
          onDateChange={setInterviewDate}
          onTimeChange={setInterviewTime}
          onTypeChange={setInterviewType}
          onLocationChange={setInterviewLocation}
          onDurationChange={setInterviewDuration}
          onNotesChange={setInterviewNotes}
          onSaveInterview={handleSaveInterview}
        />
      </div>
    </div>
  )
}