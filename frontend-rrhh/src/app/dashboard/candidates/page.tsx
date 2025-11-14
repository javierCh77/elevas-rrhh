'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  FileDown
} from 'lucide-react'
import Link from 'next/link'
import { useCandidates } from '@/hooks/useCandidates'
import { toast } from 'sonner'
import { formatDateAR } from '@/lib/date-utils'
import { CreateCandidateModal, type CandidateFormData } from '@/components/candidates/CreateCandidateModal'
import { api } from '@/lib/api'
import type { AIAnalysis } from '@/lib/types'

const statusConfig = {
  active: {
    label: 'Activo',
    icon: UserCheck,
    badgeStyle: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#16a34a',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
      border: '1px solid rgba(34, 197, 94, 0.2)'
    }
  },
  inactive: {
    label: 'Inactivo',
    icon: UserX,
    badgeStyle: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#4b5563',
      border: '1px solid rgba(107, 114, 128, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
      border: '1px solid rgba(107, 114, 128, 0.2)'
    }
  },
  blacklisted: {
    label: 'Lista Negra',
    icon: XCircle,
    badgeStyle: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    cardStyle: {
      background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 252, 245, 0.9) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  }
}

export default function CandidatesPage() {
  const { candidates, loading, error, updateCandidateStatus, createCandidate, deleteCandidate, refetch } = useCandidates()

  // State para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State para modal de crear candidato
  const [showCreateModal, setShowCreateModal] = useState(false)

  // State para análisis IA
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [selectedCandidateAnalysis, setSelectedCandidateAnalysis] = useState<AIAnalysis | null>(null)
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false)
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, AIAnalysis>>({})

  // Load existing AI analyses when candidates are loaded
  useEffect(() => {
    const loadExistingAnalyses = async () => {
      if (candidates.length === 0) return

      try {
        const analysesPromises = candidates.map(async (candidate) => {
          try {
            const response = await api.get<{ success: boolean; data: unknown }>(`/eva/candidate-profile-analysis/${candidate.id}`)
            if (response.success && response.data) {
              return { candidateId: candidate.id, analysis: response.data }
            }
            return null
          } catch {
            return null
          }
        })

        const results = await Promise.all(analysesPromises)
        const analysesMap: Record<string, AIAnalysis> = {}

        results.forEach(result => {
          if (result && result.analysis) {
            analysesMap[result.candidateId] = result.analysis as AIAnalysis
          }
        })

        setAiAnalyses(analysesMap)
      } catch (error: unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading existing analyses:', error)
        }
      }
    }

    loadExistingAnalyses()
  }, [candidates])

  // Calcular stats
  const stats = {
    total: candidates.length,
    active: candidates.filter(c => c.status === 'active').length,
    withApplications: candidates.filter(c => c.applications && c.applications.length > 0).length,
    thisMonth: candidates.filter(c => {
      const now = new Date()
      const candidateDate = new Date(c.addedAt)
      return candidateDate.getMonth() === now.getMonth() &&
             candidateDate.getFullYear() === now.getFullYear()
    }).length
  }

  // Filtrar candidatos
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch =
      candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus
    const matchesSource = selectedSource === 'all' || candidate.source === selectedSource
    const matchesSkill = selectedSkill === 'all' || candidate.skills?.includes(selectedSkill)

    return matchesSearch && matchesStatus && matchesSource && matchesSkill
  })

  // Paginación
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage)

  // Obtener fuentes únicas
  const uniqueSources = Array.from(new Set(candidates.map(c => c.source).filter(Boolean)))

  // Obtener skills únicas
  const uniqueSkills = Array.from(
    new Set(
      candidates
        .flatMap(c => c.skills || [])
        .filter(Boolean)
    )
  ).sort()

  const handleCandidateAction = async (candidateId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await updateCandidateStatus(candidateId, 'active')
          toast.success('Candidato activado exitosamente')
          break
        case 'deactivate':
          await updateCandidateStatus(candidateId, 'inactive')
          toast.success('Candidato desactivado exitosamente')
          break
        case 'blacklist':
          await updateCandidateStatus(candidateId, 'blacklisted')
          toast.success('Candidato agregado a lista negra')
          break
        case 'delete':
          // Confirmación simple antes de eliminar
          if (window.confirm('¿Estás seguro de que quieres eliminar este candidato? Esta acción no se puede deshacer.')) {
            try {
              await deleteCandidate(candidateId)
              toast.success('Candidato eliminado exitosamente')
            } catch (error: unknown) {
              // Verificar si es un error de restricción de clave foránea
              const errorMessage = error instanceof Error ? error.message : 'Error al eliminar candidato'
              if (errorMessage.includes('constraint') || errorMessage.includes('foreign key') || errorMessage.includes('violates')) {
                toast.error('No se puede eliminar este candidato porque tiene aplicaciones asociadas.')
              } else {
                toast.error(errorMessage)
              }
            }
          }
          break
      }
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error performing candidate action:', err)
      }
      toast.error('Error al realizar la acción')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || '?'}${lastName?.charAt(0) || '?'}`.toUpperCase()
  }

  // Use error handling for display
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar candidatos', {
        description: error
      })
    }
  }, [error])

  // Handle refresh
  const handleRefresh = async () => {
    await refetch()
  }

  // Handle create candidate
  const handleCreateCandidate = async (data: CandidateFormData) => {
    try {
      await createCandidate(data)
      toast.success('Candidato creado exitosamente')
      await refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear candidato'
      toast.error(errorMessage)
      throw error
    }
  }

  // Handle export to CSV
  const handleExportCSV = () => {
    try {
      // Prepare CSV headers
      const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'DNI', 'Ubicación', 'Experiencia', 'Estado', 'Fuente', 'Habilidades', 'Fecha Agregado', 'Última Actualización', 'Número de Aplicaciones']

      // Prepare CSV rows with filtered candidates
      const rows = filteredCandidates.map(candidate => [
        candidate.firstName || '',
        candidate.lastName || '',
        candidate.email || '',
        candidate.phone || '',
        candidate.dni || '',
        candidate.location || '',
        candidate.experience || '',
        statusConfig[candidate.status as keyof typeof statusConfig]?.label || candidate.status,
        candidate.source || '',
        candidate.skills?.join('; ') || '',
        formatDateAR(candidate.addedAt),
        formatDateAR(candidate.lastUpdate),
        candidate.applications?.length || 0
      ])

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `candidatos_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Se exportaron ${filteredCandidates.length} candidatos exitosamente`)
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error exporting CSV:', error)
      }
      toast.error('Error al exportar candidatos')
    }
  }

  // Generate AI Profile Analysis
  const handleGenerateAIAnalysis = async (candidateId: string) => {
    try {
      setGeneratingAnalysis(true)
      const candidate = candidates.find(c => c.id === candidateId)

      if (!candidate) {
        toast.error('Candidato no encontrado')
        return
      }

      toast.info('Generando análisis con IA...', {
        description: 'Esto puede tardar unos segundos'
      })

      const response = await api.post<{ success: boolean; data: AIAnalysis }>('/eva/analyze-candidate-profile', {
        candidateId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        experience: candidate.experience,
        skills: candidate.skills,
        linkedinUrl: candidate.linkedinUrl,
        resumeUrl: candidate.resumeUrl,
        applications: candidate.applications
      })

      if (response.success && response.data) {
        // Guardar análisis en estado
        setAiAnalyses(prev => ({
          ...prev,
          [candidateId]: response.data
        }))

        setSelectedCandidateAnalysis(response.data)
        setShowAnalysisModal(true)
        toast.success('Análisis generado exitosamente')
      } else {
        toast.error('Error al generar análisis')
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating AI analysis:', error)
      }
      const errorMessage = error instanceof Error ? error.message : 'Error al generar análisis con IA'
      toast.error(errorMessage)
    } finally {
      setGeneratingAnalysis(false)
    }
  }

  // View existing AI analysis
  const handleViewAIAnalysis = (candidateId: string) => {
    const analysis = aiAnalyses[candidateId]
    if (analysis) {
      setSelectedCandidateAnalysis(analysis)
      setShowAnalysisModal(true)
    } else {
      toast.error('No se encontró análisis para este candidato')
    }
  }

  // Function to convert markdown to HTML
  const markdownToHtml = (markdown: string) => {
    if (!markdown) return ''

    let html = markdown

    // Convert ### headings to h3
    html = html.replace(/### (.+)/g, '<h3>$1</h3>')

    // Convert ** bold ** to strong
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Convert bullet points
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // Convert line breaks to <br> but not inside lists or after headings
    html = html.split('\n').map(line => {
      if (line.includes('<h3>') || line.includes('<li>') || line.includes('<ul>') || line.includes('</ul>') || line.trim() === '') {
        return line
      }
      return line + '<br>'
    }).join('\n')

    return html
  }

  // Download AI Analysis as PDF
  const handleDownloadAnalysis = () => {
    if (!selectedCandidateAnalysis) return

    try {
      // Create HTML content for the analysis
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Análisis IA - ${selectedCandidateAnalysis.candidateName || 'Candidato'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #9333ea;
      border-bottom: 2px solid #9333ea;
      padding-bottom: 10px;
      margin-bottom: 15px;
      font-size: 22px;
    }
    .section h3 {
      color: #6b7280;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #9333ea;
      margin-bottom: 20px;
    }
    .scores {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .score-card {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .score-card.blue { background: #eff6ff; }
    .score-card.amber { background: #fffbeb; }
    .score-card.green { background: #f0fdf4; }
    .score-card.purple { background: #faf5ff; }
    .score-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .score-value {
      font-size: 32px;
      font-weight: bold;
    }
    .score-value.blue { color: #2563eb; }
    .score-value.amber { color: #d97706; }
    .score-value.green { color: #16a34a; }
    .score-value.purple { color: #9333ea; }
    .list-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .strengths, .red-flags {
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .strengths {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border-color: #86efac;
    }
    .red-flags {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-color: #fca5a5;
    }
    .strengths h3 {
      color: #15803d;
      margin-top: 0;
    }
    .red-flags h3 {
      color: #dc2626;
      margin-top: 0;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .strengths li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #16a34a;
      font-weight: bold;
    }
    .red-flags li:before {
      content: "⚠";
      position: absolute;
      left: 0;
      color: #dc2626;
    }
    .recommendation {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      font-weight: bold;
      font-size: 18px;
    }
    .recommendation.highly {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    .recommendation.recommended {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }
    .recommendation.neutral {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      color: white;
    }
    .recommendation.not-recommended {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }
    .analysis-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      line-height: 1.8;
    }
    .analysis-content h3 {
      color: #1f2937;
      font-size: 18px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-top: 16px;
      padding-bottom: 8px;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      position: relative;
      padding-left: 12px;
    }
    .analysis-content h3:before {
      content: "";
      position: absolute;
      left: 0;
      top: 16px;
      bottom: 8px;
      width: 4px;
      background: linear-gradient(180deg, #9333ea 0%, #3b82f6 100%);
      border-radius: 2px;
    }
    .analysis-content h3:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    .analysis-content h3:first-child:before {
      top: 0;
    }
    .analysis-content ul {
      list-style: none;
      padding-left: 0;
      margin: 12px 0;
    }
    .analysis-content li {
      padding: 6px 0 6px 28px;
      position: relative;
      color: #4b5563;
      line-height: 1.6;
    }
    .analysis-content li:before {
      content: "•";
      position: absolute;
      left: 8px;
      color: #9333ea;
      font-weight: bold;
      font-size: 20px;
    }
    .analysis-content strong {
      color: #1f2937;
      font-weight: 600;
    }
    .analysis-content p {
      margin: 8px 0;
      color: #4b5563;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { margin: 0; padding: 15px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Análisis IA del Candidato</h1>
    <p>${selectedCandidateAnalysis.candidateName || 'Candidato'}</p>
    <p style="font-size: 14px; margin-top: 10px;">Generado el ${formatDateAR(new Date().toISOString())}</p>
  </div>

  ${selectedCandidateAnalysis.summary ? `
  <div class="section">
    <h2>Resumen General</h2>
    <div class="summary">
      ${selectedCandidateAnalysis.summary}
    </div>
  </div>
  ` : ''}

  ${selectedCandidateAnalysis.scores ? `
  <div class="section">
    <h2>Puntuaciones</h2>
    <div class="scores">
      ${Object.entries(selectedCandidateAnalysis.scores).map(([key, value]) => {
        const labels: Record<string, { label: string; colorClass: string }> = {
          experience: { label: 'Experiencia', colorClass: 'blue' },
          technicalSkills: { label: 'Competencias', colorClass: 'amber' },
          professionalProfile: { label: 'Educación', colorClass: 'green' },
          culturalFit: { label: 'Coincidencia Global', colorClass: 'purple' }
        }
        const config = labels[key] || { label: key, colorClass: 'blue' }
        return `
          <div class="score-card ${config.colorClass}">
            <div class="score-label">${config.label}</div>
            <div class="score-value ${config.colorClass}">${value}%</div>
          </div>
        `
      }).join('')}
    </div>
  </div>
  ` : ''}

  ${selectedCandidateAnalysis.analysis ? `
  <div class="section">
    <h2>Análisis Detallado</h2>
    <div class="analysis-content">
      ${markdownToHtml(selectedCandidateAnalysis.analysis)}
    </div>
  </div>
  ` : ''}

  ${(selectedCandidateAnalysis.strengths && selectedCandidateAnalysis.strengths.length > 0) || (selectedCandidateAnalysis.redFlags && selectedCandidateAnalysis.redFlags.length > 0) ? `
  <div class="section">
    <h2>Fortalezas y Señales de Alerta</h2>
    <div class="list-section">
      ${selectedCandidateAnalysis.strengths && selectedCandidateAnalysis.strengths.length > 0 ? `
      <div class="strengths">
        <h3>Fortalezas Principales</h3>
        <ul>
          ${selectedCandidateAnalysis.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
        </ul>
      </div>
      ` : '<div></div>'}

      ${selectedCandidateAnalysis.redFlags && selectedCandidateAnalysis.redFlags.length > 0 ? `
      <div class="red-flags">
        <h3>Señales de Alerta</h3>
        <ul>
          ${selectedCandidateAnalysis.redFlags.map((flag: string) => `<li>${flag}</li>`).join('')}
        </ul>
      </div>
      ` : '<div></div>'}
    </div>
  </div>
  ` : ''}

  ${selectedCandidateAnalysis.recommendation ? `
  <div class="recommendation ${
    selectedCandidateAnalysis.recommendation === 'Altamente Recomendado' ? 'highly' :
    selectedCandidateAnalysis.recommendation === 'Recomendado' ? 'recommended' :
    selectedCandidateAnalysis.recommendation === 'Neutral' ? 'neutral' : 'not-recommended'
  }">
    Recomendación Final: ${selectedCandidateAnalysis.recommendation}
  </div>
  ` : ''}

  <div class="footer">
    <p>Análisis generado por EVA - Sistema de Análisis de Candidatos con IA</p>
    <p>Este documento es confidencial y debe ser tratado de acuerdo a las políticas de privacidad de la empresa</p>
  </div>
</body>
</html>
      `

      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      const candidateName = selectedCandidateAnalysis.candidateName || 'Candidato'
      const fileName = `Analisis_IA_${candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`

      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Análisis descargado exitosamente', {
        description: 'Puedes abrir el archivo HTML en tu navegador e imprimirlo como PDF si lo necesitas'
      })
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error downloading analysis:', error)
      }
      toast.error('Error al descargar el análisis')
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
                Gestión de Candidatos
              </h1>
              <p className="text-sm sm:text-base text-amber-700/80 leading-relaxed">
                Administra candidatos del sistema, estados y aplicaciones de manera eficiente
              </p>
            </div>
            {loading && (
              <div className="flex-shrink-0">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" style={{color: '#cfaf6e'}} />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className="h-10 sm:h-11 transition-all duration-300 touch-manipulation text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
              <span className="sm:hidden">Refrescar</span>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-fit h-10 sm:h-11 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-md touch-manipulation bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Nuevo Candidato</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="w-full sm:w-fit h-10 sm:h-11 transition-all duration-300 cursor-pointer border-amber-200/50 text-amber-700 hover:bg-amber-50/50"
            >
              <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Candidatos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Con Aplicaciones</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.withApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-500 to-violet-500">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Este Mes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Mobile First */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-end">
            <div className="flex-1 lg:max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar candidatos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
                <Input
                  placeholder="Nombre, email, DNI, skills, ubicación, fuente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 text-base transition-all duration-200 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:flex-wrap">
              <div className="flex-1 sm:max-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="blacklisted">Lista Negra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 sm:max-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuente</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {uniqueSources.map((source) => (
                      <SelectItem key={source} value={source!}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 sm:max-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Habilidad</label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-full h-11" style={{ borderRadius: '12px' }}>
                    <SelectValue placeholder="Seleccionar skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {uniqueSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Candidates List - Mobile First Design */}
        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="border-b border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
                    <div className="col-span-2">Candidato</div>
                    <div className="col-span-2">Contacto</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      Análisis con IA
                    </div>
                    <div className="col-span-1 text-center">Apps</div>
                    <div className="col-span-2">Agregado</div>
                    <div className="col-span-1 text-right">Acciones</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {paginatedCandidates.map((candidate) => {
                    const statusInfo = statusConfig[candidate.status as keyof typeof statusConfig]
                    const StatusIcon = statusInfo.icon

                    return (
                      <div
                        key={candidate.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group"
                      >
                        {/* Candidato */}
                        <div className="col-span-2 flex items-center space-x-3 min-w-0">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm flex-shrink-0">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.firstName}+${candidate.lastName}`} />
                            <AvatarFallback style={{
                              backgroundColor: 'rgba(207, 175, 110, 0.1)',
                              color: '#a37d43',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}>{getInitials(candidate.firstName, candidate.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                              {candidate.firstName} {candidate.lastName}
                            </p>
                            {candidate.location && (
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {candidate.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Contacto */}
                        <div className="col-span-2 flex flex-col justify-center space-y-1">
                          <p className="text-sm text-gray-900 truncate flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {candidate.email}
                          </p>
                          {candidate.phone && (
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {candidate.phone}
                            </p>
                          )}
                        </div>

                        {/* Estado */}
                        <div className="col-span-2 flex items-center">
                          <Badge
                            className="px-2 py-1 text-xs font-medium rounded-full border-0"
                            style={statusInfo.badgeStyle}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Análisis con IA */}
                        <div className="col-span-2 flex items-center justify-center">
                          {aiAnalyses[candidate.id] ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAIAnalysis(candidate.id)}
                              className="h-10 w-10 p-0 rounded-full hover:bg-purple-50 transition-all"
                              title="Ver análisis con IA"
                            >
                              <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Brain className="h-4 w-4" />
                              <span>Sin análisis</span>
                            </div>
                          )}
                        </div>

                        {/* Número de Aplicaciones */}
                        <div className="col-span-1 flex items-center justify-center">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700">
                              {candidate.applications?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Agregado */}
                        <div className="col-span-2 flex items-center">
                          <p className="text-sm text-gray-500">{formatDateAR(candidate.addedAt)}</p>
                        </div>

                        {/* Acciones */}
                        <div className="col-span-1 flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/candidates/${candidate.id}`} className="cursor-pointer flex items-center">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver perfil completo
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleGenerateAIAnalysis(candidate.id)}
                                disabled={generatingAnalysis}
                                className="cursor-pointer"
                              >
                                <Brain className="h-4 w-4 mr-2 text-purple-600" />
                                Generar Análisis con IA
                              </DropdownMenuItem>
                              {candidate.resumeUrl && (
                                <DropdownMenuItem
                                  onClick={() => window.open(`http://localhost:3000${candidate.resumeUrl}`, '_blank')}
                                  className="cursor-pointer"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver CV
                                </DropdownMenuItem>
                              )}
                              {candidate.linkedinUrl && (
                                <DropdownMenuItem
                                  onClick={() => window.open(candidate.linkedinUrl, '_blank')}
                                  className="cursor-pointer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Ver LinkedIn
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {candidate.status === 'active' ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleCandidateAction(candidate.id, 'deactivate')}
                                    className="cursor-pointer"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Desactivar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCandidateAction(candidate.id, 'blacklist')}
                                    className="cursor-pointer"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Lista Negra
                                  </DropdownMenuItem>
                                </>
                              ) : candidate.status === 'inactive' ? (
                                <DropdownMenuItem
                                  onClick={() => handleCandidateAction(candidate.id, 'activate')}
                                  className="cursor-pointer"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleCandidateAction(candidate.id, 'activate')}
                                  className="cursor-pointer"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Reactivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {candidate.applications && candidate.applications.length > 0 ? (
                                <DropdownMenuItem
                                  disabled
                                  className="cursor-not-allowed opacity-50"
                                  title="No se puede eliminar: tiene aplicaciones asociadas"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar candidato
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleCandidateAction(candidate.id, 'delete')}
                                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar candidato
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View - Visible only on Mobile & Tablet */}
          <div className="lg:hidden">
            <div className="space-y-3 p-3 sm:p-4">
              {paginatedCandidates.map((candidate) => {
                const statusInfo = statusConfig[candidate.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo.icon

                return (
                  <Card
                    key={candidate.id}
                    className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98] touch-manipulation"
                    style={{
                      ...statusInfo.cardStyle,
                      borderRadius: '12px',
                      minHeight: '140px'
                    }}
                  >
                    <CardContent className="p-4">
                      {/* Header with Avatar, Name and Actions */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-md flex-shrink-0">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.firstName}+${candidate.lastName}`} />
                            <AvatarFallback style={{
                              backgroundColor: 'rgba(207, 175, 110, 0.1)',
                              color: '#a37d43',
                              fontWeight: '600',
                              fontSize: '14px'
                            }}>{getInitials(candidate.firstName, candidate.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            {candidate.location && (
                              <p className="text-sm text-gray-600 truncate mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {candidate.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/candidates/${candidate.id}`} className="cursor-pointer flex items-center">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver perfil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleGenerateAIAnalysis(candidate.id)}
                              disabled={generatingAnalysis}
                              className="cursor-pointer"
                            >
                              <Brain className="h-4 w-4 mr-2 text-purple-600" />
                              Generar Análisis con IA
                            </DropdownMenuItem>
                            {candidate.resumeUrl && (
                              <DropdownMenuItem
                                onClick={() => window.open(`http://localhost:3000${candidate.resumeUrl}`, '_blank')}
                                className="cursor-pointer"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Ver CV
                              </DropdownMenuItem>
                            )}
                            {candidate.linkedinUrl && (
                              <DropdownMenuItem
                                onClick={() => window.open(candidate.linkedinUrl, '_blank')}
                                className="cursor-pointer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver LinkedIn
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {candidate.status === 'active' ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleCandidateAction(candidate.id, 'deactivate')}
                                  className="cursor-pointer"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Desactivar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCandidateAction(candidate.id, 'blacklist')}
                                  className="cursor-pointer"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Lista Negra
                                </DropdownMenuItem>
                              </>
                            ) : candidate.status === 'inactive' ? (
                              <DropdownMenuItem
                                onClick={() => handleCandidateAction(candidate.id, 'activate')}
                                className="cursor-pointer"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleCandidateAction(candidate.id, 'activate')}
                                className="cursor-pointer"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Reactivar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {candidate.applications && candidate.applications.length > 0 ? (
                              <DropdownMenuItem
                                disabled
                                className="cursor-not-allowed opacity-50"
                                title="No se puede eliminar: tiene aplicaciones asociadas"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar candidato
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleCandidateAction(candidate.id, 'delete')}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar candidato
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          className="px-2 py-1 text-xs font-medium rounded-full border-0"
                          style={statusInfo.badgeStyle}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <p className="text-xs text-gray-500">{formatDateAR(candidate.addedAt)}</p>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {candidate.email}
                        </p>
                        {candidate.phone && (
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {candidate.phone}
                          </p>
                        )}
                        {candidate.experience && (
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Briefcase className="h-3 w-3 text-gray-400" />
                            {candidate.experience}
                          </p>
                        )}

                        {/* Skills */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 border-amber-200">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Applications count */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
                          <Briefcase className="h-4 w-4 text-amber-600" />
                          <span className="font-medium">{candidate.applications?.length || 0}</span>
                          <span className="text-gray-500">aplicaciones</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCandidates.length)} de {filteredCandidates.length} candidatos
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-9 px-3 border-amber-200/50 text-amber-700 hover:bg-amber-50/50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 border-amber-200/50 text-amber-700 hover:bg-amber-50/50"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Modal para crear candidato */}
        <CreateCandidateModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSubmit={handleCreateCandidate}
        />

        {/* Modal para mostrar análisis IA */}
        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] flex flex-col bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 overflow-hidden">
            <DialogHeader className="pb-4 border-b border-purple-100 flex-shrink-0">
              <DialogTitle className="flex items-center gap-3 text-xl lg:text-2xl">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex-shrink-0">
                  <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                    Análisis IA del Candidato
                  </div>
                  {selectedCandidateAnalysis?.candidateName && (
                    <div className="text-xs lg:text-sm font-normal text-gray-600 mt-0.5 truncate">
                      {selectedCandidateAnalysis.candidateName}
                    </div>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedCandidateAnalysis && (
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-5 py-4 px-1">
                  {/* Summary Card */}
                  {selectedCandidateAnalysis.summary && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-200/50 shadow-sm">
                      <h3 className="text-base font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Resumen General
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm">{selectedCandidateAnalysis.summary}</p>
                    </div>
                  )}

                  {/* Scores Grid - Similar to the image */}
                  {selectedCandidateAnalysis.scores && (
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(selectedCandidateAnalysis.scores).map(([key, value]) => {
                        const scoreValue = value as number
                        const labels: Record<string, { label: string; bg: string; text: string; border: string }> = {
                          experience: {
                            label: 'Experiencia',
                            bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
                            text: 'text-blue-700',
                            border: 'border-blue-200/50'
                          },
                          technicalSkills: {
                            label: 'Competencias',
                            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
                            text: 'text-amber-700',
                            border: 'border-amber-200/50'
                          },
                          professionalProfile: {
                            label: 'Educación',
                            bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
                            text: 'text-green-700',
                            border: 'border-green-200/50'
                          },
                          culturalFit: {
                            label: 'Coincidencia Global',
                            bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
                            text: 'text-purple-700',
                            border: 'border-purple-200/50'
                          }
                        }
                        const config = labels[key] || {
                          label: key,
                          bg: 'bg-gray-50',
                          text: 'text-gray-700',
                          border: 'border-gray-200'
                        }

                        return (
                          <div key={key} className={`${config.bg} rounded-xl p-4 border ${config.border} text-center shadow-sm`}>
                            <div className="text-xs font-medium text-gray-600 mb-2">
                              {config.label}
                            </div>
                            <div className={`text-3xl font-bold ${config.text}`}>
                              {scoreValue}%
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Detailed Analysis with Markdown */}
                  {selectedCandidateAnalysis.analysis && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-200/50 shadow-sm">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h3: ({...props}) => (
                              <h3 className="text-base font-bold text-gray-800 mt-4 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2" {...props}>
                                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                                {props.children}
                              </h3>
                            ),
                            h4: ({...props}) => <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-2" {...props} />,
                            ul: ({...props}) => <ul className="space-y-2 my-3" {...props} />,
                            ol: ({...props}) => <ol className="space-y-2 my-3" {...props} />,
                            li: ({...props}) => (
                              <li className="text-gray-600 leading-relaxed text-sm flex items-start gap-2 ml-4" {...props}>
                                <span className="text-purple-500 mt-1.5">•</span>
                                <span className="flex-1">{props.children}</span>
                              </li>
                            ),
                            p: ({...props}) => <p className="text-gray-600 leading-relaxed text-sm my-2" {...props} />,
                            strong: ({...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                          }}
                        >
                          {selectedCandidateAnalysis.analysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Strengths and Red Flags in Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Strengths */}
                    {selectedCandidateAnalysis.strengths && selectedCandidateAnalysis.strengths.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200/50 shadow-sm">
                        <h3 className="text-base font-bold text-green-800 mb-4 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Fortalezas
                        </h3>
                        <ul className="space-y-2.5">
                          {selectedCandidateAnalysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start gap-2.5 text-sm text-green-800">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              <span className="flex-1">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Red Flags */}
                    {selectedCandidateAnalysis.redFlags && selectedCandidateAnalysis.redFlags.length > 0 && (
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border border-red-200/50 shadow-sm">
                        <h3 className="text-base font-bold text-red-800 mb-4 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          Señales de Alerta
                        </h3>
                        <ul className="space-y-2.5">
                          {selectedCandidateAnalysis.redFlags.map((flag: string, index: number) => (
                            <li key={index} className="flex items-start gap-2.5 text-sm text-red-800">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                              <span className="flex-1">{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Badge at Bottom */}
                  {selectedCandidateAnalysis.recommendation && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-sm font-medium text-gray-600">Recomendación Final:</span>
                      <Badge
                        className={`px-4 py-2 text-sm font-semibold shadow-sm ${
                          selectedCandidateAnalysis.recommendation === 'Altamente Recomendado'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
                            : selectedCandidateAnalysis.recommendation === 'Recomendado'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0'
                            : selectedCandidateAnalysis.recommendation === 'Neutral'
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0'
                            : 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0'
                        }`}
                      >
                        {selectedCandidateAnalysis.recommendation === 'Altamente Recomendado' && <TrendingUp className="h-4 w-4 mr-1.5 inline" />}
                        {selectedCandidateAnalysis.recommendation === 'Recomendado' && <TrendingUp className="h-4 w-4 mr-1.5 inline" />}
                        {selectedCandidateAnalysis.recommendation === 'Neutral' && <Minus className="h-4 w-4 mr-1.5 inline" />}
                        {selectedCandidateAnalysis.recommendation === 'No Recomendado' && <TrendingDown className="h-4 w-4 mr-1.5 inline" />}
                        {selectedCandidateAnalysis.recommendation}
                      </Badge>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-between pt-4 border-t border-purple-100 gap-2">
              <Button
                onClick={handleDownloadAnalysis}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Descargar Análisis
              </Button>
              <Button
                onClick={() => setShowAnalysisModal(false)}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}