'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Calendar,
  Building,
  Target,
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle,
  Loader2,
  FileText,
  Share2,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useJobs, Job } from '@/hooks/useJobs'

const statusConfig = {
  active: {
    label: 'Activo',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  paused: {
    label: 'Pausado',
    icon: Pause,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  closed: {
    label: 'Cerrado',
    icon: XCircle,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  },
  draft: {
    label: 'Borrador',
    icon: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { jobs, loading, error } = useJobs()
  const [job, setJob] = useState<Job | null>(null)

  const jobId = params?.id as string

  useEffect(() => {
    if (jobs.length > 0 && jobId) {
      const foundJob = jobs.find(j => j.id === jobId)
      setJob(foundJob || null)
    }
  }, [jobs, jobId])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#cfaf6e]" />
          <p className="text-gray-600">Cargando detalles del puesto...</p>
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
          <Button onClick={() => router.back()} className="bg-[#cfaf6e] hover:bg-[#a37d43]">
            Volver
          </Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Puesto no encontrado</h2>
          <p className="text-gray-600 mb-4">El puesto que buscas no existe o ha sido eliminado.</p>
          <Link href="/dashboard/jobs">
            <Button className="bg-[#cfaf6e] hover:bg-[#a37d43]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Puestos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[job.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <Badge className={`flex items-center space-x-1 ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{statusInfo.label}</span>
                </Badge>
                <span className="text-sm text-gray-500">ID: {job.id}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/jobs/${job.id}/edit`} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar puesto
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/jobs/${job.id}/applications`} className="cursor-pointer">
                  <Users className="h-4 w-4 mr-2" />
                  Ver aplicaciones
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir puesto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-[#cfaf6e]" />
                  <span>Descripción del Puesto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>

                {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Responsabilidades:</h4>
                    <ul className="space-y-2">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#cfaf6e] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Requisitos:</h4>
                    <ul className="space-y-2">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#cfaf6e] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Habilidades requeridas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#cfaf6e]/10 text-[#a37d43] border-[#cfaf6e]/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Beneficios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Puesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Departamento</p>
                    <p className="font-medium">{job.department}</p>
                  </div>
                </div>

                {job.salaryRange && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Salario</p>
                      <p className="font-medium">{job.salaryRange}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Contrato</p>
                    <p className="font-medium">{job.contractType || 'Tiempo completo'}</p>
                  </div>
                </div>

                {job.deadline && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha límite</p>
                      <p className="font-medium">
                        {new Date(job.deadline).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Aplicaciones</p>
                    <p className="font-medium">{job.applicationsCount}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Vistas</p>
                    <p className="font-medium">{job.viewsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/jobs/${job.id}/applications`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Ver Aplicaciones ({job.applicationsCount})
                  </Button>
                </Link>

                <Link href={`/dashboard/jobs/${job.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Puesto
                  </Button>
                </Link>

                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}