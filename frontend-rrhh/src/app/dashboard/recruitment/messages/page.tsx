'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCandidates } from '@/hooks/useCandidates'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Mail,
  Send,

  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Briefcase,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import {  formatDateTimeAR } from '@/lib/date-utils'

// Message templates
const messageTemplates = {
  invitation: {
    label: 'Invitación a Entrevista',
    subject: 'Invitación a entrevista - {{jobTitle}}',
    body: `Estimado/a {{candidateName}},

Nos complace informarte que tu perfil ha sido seleccionado para continuar en el proceso de selección para el puesto de {{jobTitle}}.

Queremos invitarte a una entrevista que se realizará el día {{interviewDate}} a las {{interviewTime}}.

Detalles de la entrevista:
- Tipo: {{interviewType}}
- Duración estimada: {{duration}} minutos
- Ubicación/Link: {{location}}

Por favor, confirma tu asistencia respondiendo a este correo.

Quedamos a tu disposición para cualquier consulta.

Saludos cordiales,
{{recruiterName}}`
  },
  rejection: {
    label: 'Rechazo de Candidatura',
    subject: 'Proceso de selección - {{jobTitle}}',
    body: `Estimado/a {{candidateName}},

Agradecemos sinceramente tu interés en formar parte de nuestro equipo y el tiempo dedicado a participar en nuestro proceso de selección para el puesto de {{jobTitle}}.

Después de una cuidadosa evaluación, lamentamos informarte que en esta ocasión hemos decidido continuar con otros candidatos cuyo perfil se ajusta más específicamente a los requisitos de esta posición.

Valoramos mucho tu interés en nuestra empresa y te animamos a estar atento/a a futuras oportunidades que puedan ajustarse mejor a tu perfil profesional.

Te deseamos mucho éxito en tu búsqueda laboral.

Atentamente,
{{recruiterName}}`
  },
  offer: {
    label: 'Oferta de Trabajo',
    subject: 'Oferta de empleo - {{jobTitle}}',
    body: `Estimado/a {{candidateName}},

¡Felicitaciones! Nos complace ofrecerte el puesto de {{jobTitle}} en nuestra empresa.

Detalles de la oferta:
- Posición: {{jobTitle}}
- Departamento: {{department}}
- Tipo de contrato: {{contractType}}
- Salario: {{salary}}
- Fecha de inicio propuesta: {{startDate}}
- Modalidad: {{modality}}

Adjunto encontrarás el documento completo con los detalles de la oferta y las condiciones de empleo.

Por favor, confirma tu aceptación respondiendo a este correo antes del {{deadline}}.

¡Esperamos contar contigo en nuestro equipo!

Saludos cordiales,
{{recruiterName}}`
  },
  followup: {
    label: 'Seguimiento',
    subject: 'Seguimiento de tu aplicación - {{jobTitle}}',
    body: `Estimado/a {{candidateName}},

Queremos informarte sobre el estado de tu aplicación para el puesto de {{jobTitle}}.

Actualmente, tu candidatura se encuentra en la etapa de {{stage}}. Estamos en proceso de revisión y evaluación de todos los perfiles.

Te mantendremos informado/a sobre cualquier novedad en los próximos días.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos cordiales,
{{recruiterName}}`
  },
  request_info: {
    label: 'Solicitud de Información',
    subject: 'Información adicional necesaria - {{jobTitle}}',
    body: `Estimado/a {{candidateName}},

Hemos revisado tu aplicación para el puesto de {{jobTitle}} y nos gustaría solicitar información adicional para continuar con el proceso.

Por favor, envíanos:
- {{requestedInfo}}

Agradecemos tu pronta respuesta.

Saludos cordiales,
{{recruiterName}}`
  },
  thank_you: {
    label: 'Agradecimiento por Entrevista',
    subject: 'Gracias por tu tiempo - {{jobTitle}}',
    body: `Estimado/a {{candidateName}},

Queremos agradecerte por el tiempo dedicado a la entrevista para el puesto de {{jobTitle}}.

Fue un placer conocerte y aprender más sobre tu experiencia y trayectoria profesional.

Estamos evaluando todos los candidatos y te informaremos sobre los próximos pasos en breve.

Saludos cordiales,
{{recruiterName}}`
  }
}

interface Message {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  jobTitle?: string
  template: string
  subject: string
  body: string
  sentAt: Date
  status: 'sent' | 'failed' | 'draft'
  sentBy: string
}

export default function MessagesPage() {
  const { candidates, loading } = useCandidates()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof messageTemplates>('invitation')
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [viewMessageId, setViewMessageId] = useState<string | null>(null)

  // Message history (connected to backend via email sending)
  const [messages, setMessages] = useState<Message[]>([])

  // Load messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { api } = await import('@/lib/api')
        const response = await api.get<{ messages: Record<string, unknown>[] }>('/candidates/messages?limit=100')

        if (response.messages) {
          const transformedMessages: Message[] = response.messages.map((msg: Record<string, unknown>) => ({
            id: msg.id as string,
            candidateId: msg.candidateId as string,
            candidateName: msg.candidateName as string,
            candidateEmail: msg.candidateEmail as string,
            jobTitle: msg.jobTitle as string,
            template: msg.template as string,
            subject: msg.subject as string,
            body: msg.body as string,
            sentAt: new Date(msg.sentAt as string | Date),
            status: msg.status as 'draft' | 'sent' | 'failed',
            sentBy: msg.sentBy ? `${(msg.sentBy as Record<string, unknown>).firstName} ${(msg.sentBy as Record<string, unknown>).lastName}` : 'Sistema'
          }))
          setMessages(transformedMessages)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    fetchMessages()
  }, [])

  // Filter candidates by search
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch =
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [candidates, searchTerm])

  // Get candidate by ID
  const getCandidateById = (id: string) => {
    return candidates.find(c => c.id === id)
  }

  // Get job title from selected application
  const getJobTitle = (candidate: Record<string, unknown>, applicationId: string | null): string => {
    if (!applicationId && candidate.applications && Array.isArray(candidate.applications) && candidate.applications.length > 0) {
      // Si no hay aplicación seleccionada, usar la primera
      return (candidate.applications[0] as Record<string, unknown>).jobTitle as string
    }

    if (applicationId && candidate.applications && Array.isArray(candidate.applications)) {
      const app = candidate.applications.find((a: unknown) => (a as Record<string, unknown>).id === applicationId) as Record<string, unknown> | undefined
      return (app?.jobTitle as string) || 'Puesto de Trabajo'
    }

    return 'Puesto de Trabajo'
  }

  // Handle template selection
  const handleTemplateChange = (template: keyof typeof messageTemplates) => {
    setSelectedTemplate(template)
    const templateData = messageTemplates[template]
    setMessageSubject(templateData.subject)
    setMessageBody(templateData.body)
  }

  // Open compose dialog
  const handleComposeMessage = (candidateId?: string) => {
    if (candidateId) {
      setSelectedCandidate(candidateId)
    }
    handleTemplateChange('invitation')
    setIsComposeOpen(true)
  }

  // Send message
  const handleSendMessage = async () => {
    if (!selectedCandidate || !messageSubject || !messageBody) {
      toast.error('Por favor completa todos los campos')
      return
    }

    const candidate = getCandidateById(selectedCandidate) as Record<string, unknown> | undefined
    if (!candidate) {
      toast.error('Candidato no encontrado')
      return
    }

    setIsSending(true)

    try {
      // Import api dynamically to avoid issues
      const { api } = await import('@/lib/api')

      // Get job title from candidate's applications
      const jobTitle = getJobTitle(candidate, null)

      // Send email via API (backend saves to database)
      const response = await api.post<{ data: Record<string, unknown> }>('/candidates/send-email', {
        candidateId: candidate.id,
        subject: messageSubject,
        body: messageBody,
        template: selectedTemplate,
        jobTitle: jobTitle
      })

      // Add the saved message from backend to local state
      if (response.data) {
        const data = response.data as Record<string, unknown>
        const savedMessage: Message = {
          id: data.id as string,
          candidateId: data.candidateId as string,
          candidateName: data.candidateName as string,
          candidateEmail: data.candidateEmail as string,
          jobTitle: data.jobTitle as string,
          template: data.template as string,
          subject: data.subject as string,
          body: data.body as string,
          sentAt: new Date(data.sentAt as string | Date),
          status: data.status as 'draft' | 'sent' | 'failed',
          sentBy: user ? `${user.firstName} ${user.lastName}` : 'Sistema'
        }
        setMessages(prev => [savedMessage, ...prev])
      }
      toast.success(`Email enviado exitosamente a ${candidate.email}`)
      setIsComposeOpen(false)
      setSelectedCandidate(null)
      setMessageSubject('')
      setMessageBody('')
    } catch (error: unknown) {
      console.error('Error sending email:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar el mensaje'
      toast.error(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  // View message details
  const handleViewMessage = (messageId: string) => {
    setViewMessageId(messageId)
  }

  const viewedMessage = messages.find(m => m.id === viewMessageId)

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-4 w-128" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajería con Candidatos</h1>
        <p className="text-gray-600">Comunícate con los candidatos usando plantillas predefinidas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                <p className="text-3xl font-bold text-gray-900">{messages.filter(m => m.status === 'sent').length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borradores</p>
                <p className="text-3xl font-bold text-amber-600">{messages.filter(m => m.status === 'draft').length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-3xl font-bold text-red-600">{messages.filter(m => m.status === 'failed').length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Candidatos</CardTitle>
            <CardDescription>Selecciona un candidato para enviar un mensaje</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar candidato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Candidates */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron candidatos</p>
                </div>
              ) : (
                filteredCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleComposeMessage(candidate.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                          {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{candidate.email}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Message count */}
                    {messages.filter(m => m.candidateId === candidate.id).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {messages.filter(m => m.candidateId === candidate.id).length} mensaje(s)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Historial de Mensajes</CardTitle>
            <CardDescription>Revisa los mensajes enviados a los candidatos</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No hay mensajes aún</p>
                <p className="text-sm mb-4">Comienza a comunicarte con los candidatos</p>
                <Button onClick={() => handleComposeMessage()}>
                  <Send className="h-4 w-4 mr-2" />
                  Nuevo Mensaje
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {messages.map(message => {
                  const statusConfig = {
                    sent: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Enviado' },
                    draft: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Borrador' },
                    failed: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Fallido' }
                  }
                  const config = statusConfig[message.status]
                  const StatusIcon = config.icon

                  return (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">{message.candidateName}</p>
                            <Badge variant="secondary" className={`${config.bgColor} ${config.color} text-xs`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{message.candidateEmail}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewMessage(message.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Subject */}
                      <p className="text-sm font-medium text-gray-800 mb-1">{message.subject}</p>

                      {/* Body preview */}
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{message.body}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span>{formatDateTimeAR(message.sentAt)}</span>
                          {message.jobTitle && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {message.jobTitle}
                            </span>
                          )}
                        </div>
                        <span>Por {message.sentBy}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Mensaje</DialogTitle>
            <DialogDescription>
              Envía un mensaje al candidato usando una plantilla predefinida
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Candidate Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Candidato</label>
              <Select value={selectedCandidate || undefined} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un candidato" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map(candidate => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.firstName} {candidate.lastName} - {candidate.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Plantilla</label>
              <Select
                value={selectedTemplate}
                onValueChange={(value) => handleTemplateChange(value as keyof typeof messageTemplates)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(messageTemplates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Asunto</label>
              <Input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Asunto del mensaje"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Mensaje</label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa variables como {'{{candidateName}}, {{jobTitle}}'}, etc. para personalizar el mensaje
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsComposeOpen(false)}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !selectedCandidate}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={viewMessageId !== null} onOpenChange={() => setViewMessageId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Mensaje</DialogTitle>
          </DialogHeader>

          {viewedMessage && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Para:</p>
                <p className="text-sm text-gray-900">
                  {viewedMessage.candidateName} ({viewedMessage.candidateEmail})
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Asunto:</p>
                <p className="text-sm text-gray-900">{viewedMessage.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Mensaje:</p>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-800">
                  {viewedMessage.body}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                <span>Enviado: {formatDateTimeAR(viewedMessage.sentAt)}</span>
                <span>Por: {viewedMessage.sentBy}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
