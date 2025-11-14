'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  ExternalLink,
  UserCheck,
  UserX,
  XCircle,
  Clock,
  Globe
} from 'lucide-react'
import { useCandidates } from '@/hooks/useCandidates'
import { Candidate } from '@/hooks/useCandidates'
import { toast } from 'sonner'
import { formatDateAR } from '@/lib/date-utils'

const statusConfig = {
  active: {
    label: 'Activo',
    icon: UserCheck,
    badgeStyle: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#16a34a',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    }
  },
  inactive: {
    label: 'Inactivo',
    icon: UserX,
    badgeStyle: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#4b5563',
      border: '1px solid rgba(107, 114, 128, 0.3)'
    }
  },
  blacklisted: {
    label: 'Lista Negra',
    icon: XCircle,
    badgeStyle: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    }
  }
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params.id as string

  const { candidates, updateCandidateStatus } = useCandidates()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (candidates.length > 0) {
      const foundCandidate = candidates.find(c => c.id === candidateId)
      setCandidate(foundCandidate || null)
      setLoading(false)
    }
  }, [candidates, candidateId])

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'blacklisted') => {
    if (!candidate) return

    try {
      await updateCandidateStatus(candidate.id, newStatus)
      setCandidate(prev => prev ? { ...prev, status: newStatus } : null)
      toast.success('Estado actualizado exitosamente')
    } catch {
      toast.error('Error al actualizar el estado')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || '?'}${lastName?.charAt(0) || '?'}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 flex items-center justify-center">
        <Card className="p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidato no encontrado</h2>
          <p className="text-gray-600 mb-4">El candidato que buscas no existe o fue eliminado.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    )
  }

  const statusInfo = statusConfig[candidate.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="border-amber-200/50 text-amber-700 hover:bg-amber-50/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Perfil del Candidato
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.firstName}+${candidate.lastName}`} />
                    <AvatarFallback style={{
                      backgroundColor: 'rgba(207, 175, 110, 0.1)',
                      color: '#a37d43',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>{getInitials(candidate.firstName, candidate.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </h2>
                      <Badge
                        className="w-fit px-3 py-1 text-sm font-medium rounded-full border-0"
                        style={statusInfo.badgeStyle}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    {candidate.location && (
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {candidate.location}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900">{candidate.email}</p>
                      </div>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="text-gray-900">{candidate.phone}</p>
                        </div>
                      </div>
                    )}
                    {candidate.dni && (
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">DNI</p>
                          <p className="text-gray-900">{candidate.dni}</p>
                        </div>
                      </div>
                    )}
                    {candidate.experience && (
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Experiencia</p>
                          <p className="text-gray-900">{candidate.experience}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Enlaces</h3>
                  <div className="flex flex-wrap gap-3">
                    {candidate.resumeUrl && (
                      <Button
                        onClick={() => window.open(`http://localhost:3000${candidate.resumeUrl}`, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver CV
                      </Button>
                    )}
                    {candidate.linkedinUrl && (
                      <Button
                        onClick={() => window.open(candidate.linkedinUrl, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {candidate.portfolioUrl && (
                      <Button
                        onClick={() => window.open(candidate.portfolioUrl, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Portfolio
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.status === 'active' ? (
                  <>
                    <Button
                      onClick={() => handleStatusChange('inactive')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Desactivar
                    </Button>
                    <Button
                      onClick={() => handleStatusChange('blacklisted')}
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Lista Negra
                    </Button>
                  </>
                ) : candidate.status === 'inactive' ? (
                  <Button
                    onClick={() => handleStatusChange('active')}
                    variant="outline"
                    className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activar
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleStatusChange('active')}
                    variant="outline"
                    className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Reactivar
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Agregado</p>
                    <p className="text-gray-900">{formatDateAR(candidate.addedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Última actualización</p>
                    <p className="text-gray-900">{formatDateAR(candidate.lastUpdate)}</p>
                  </div>
                </div>
                {candidate.source && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fuente</p>
                      <p className="text-gray-900">{candidate.source}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications Card */}
            {candidate.applications && candidate.applications.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Aplicaciones ({candidate.applications.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.applications.map((application) => (
                    <div key={application.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{application.jobTitle}</p>
                        <Badge variant="secondary" className="text-xs">
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{application.department}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateAR(application.appliedAt)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}