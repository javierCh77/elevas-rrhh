'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageCircle,
  Send,
  Search,
  Clock,
  CheckCheck,
  AlertCircle,
  Phone,

  Briefcase,

  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  Settings,
  Webhook,
  ExternalLink
} from 'lucide-react'
import { useCandidates } from '@/hooks/useCandidates'
import { useJobs } from '@/hooks/useJobs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useNotification } from '@/hooks/useNotification'
import { formatDateAR } from '@/lib/date-utils'
import { api } from '@/lib/api'

// Message templates
const MESSAGE_TEMPLATES = [
  {
    id: 'interview_confirmation',
    name: 'Confirmación de Entrevista',
    category: 'Entrevistas',
    content: `Hola {{firstName}},

¡Te confirmamos tu entrevista para el puesto de {{jobTitle}}!

📅 Fecha: {{interviewDate}}
🕒 Hora: {{interviewTime}}
📍 Lugar: {{location}}

Por favor, confirma tu asistencia.

Saludos,
{{companyName}}`
  },
  {
    id: 'interview_reminder',
    name: 'Recordatorio de Entrevista',
    category: 'Entrevistas',
    content: `Hola {{firstName}},

Te recordamos que mañana tienes tu entrevista para {{jobTitle}}.

🕒 Hora: {{interviewTime}}
📍 {{location}}

¡Te esperamos!

Saludos,
{{companyName}}`
  },
  {
    id: 'application_received',
    name: 'Postulación Recibida',
    category: 'Postulaciones',
    content: `Hola {{firstName}},

¡Gracias por postularte al puesto de {{jobTitle}}!

Hemos recibido tu CV y lo revisaremos en los próximos días. Te contactaremos si tu perfil avanza en el proceso.

Saludos,
{{companyName}}`
  },
  {
    id: 'profile_selected',
    name: 'Perfil Seleccionado',
    category: 'Postulaciones',
    content: `¡Hola {{firstName}}!

Nos complace informarte que tu perfil ha sido seleccionado para continuar en el proceso de selección para {{jobTitle}}.

Pronto nos pondremos en contacto para coordinar los próximos pasos.

Saludos,
{{companyName}}`
  },
  {
    id: 'rejection_cordial',
    name: 'Rechazo Cordial',
    category: 'Postulaciones',
    content: `Hola {{firstName}},

Gracias por tu interés en el puesto de {{jobTitle}}.

Después de revisar tu perfil, en esta ocasión hemos decidido continuar con otros candidatos que se ajustan más a lo que buscamos.

Valoramos tu tiempo y te deseamos mucho éxito en tu búsqueda laboral.

Saludos,
{{companyName}}`
  },
  {
    id: 'follow_up',
    name: 'Seguimiento General',
    category: 'Seguimiento',
    content: `Hola {{firstName}},

Queremos hacerte un seguimiento respecto a tu postulación para {{jobTitle}}.

¿Sigues interesado/a en continuar con el proceso?

Saludos,
{{companyName}}`
  },
  {
    id: 'custom',
    name: 'Mensaje Personalizado',
    category: 'Personalizado',
    content: ''
  }
]

interface WhatsAppMessage {
  id: string
  candidateId: string
  candidateName: string
  phone: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt?: Date
  templateId?: string
}

export default function WhatsAppPage() {
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs } = useJobs()
  const { success: showSuccess, error: showError } = useNotification()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_phone' | 'without_phone'>('with_phone')
  const [filterJob, setFilterJob] = useState<string>('all')

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [messageContent, setMessageContent] = useState('')
  const [messageHistory, setMessageHistory] = useState<WhatsAppMessage[]>([])
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false)

  // Filter candidates with phone numbers
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search filter
      const matchesSearch =
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone?.includes(searchTerm)

      // Phone filter
      const hasPhone = candidate.phone && candidate.phone.trim() !== ''
      const matchesPhoneFilter =
        filterStatus === 'all' ||
        (filterStatus === 'with_phone' && hasPhone) ||
        (filterStatus === 'without_phone' && !hasPhone)

      // Job filter
      const matchesJobFilter = filterJob === 'all' ||
        candidate.applications?.some(app => app.jobId === filterJob)

      return matchesSearch && matchesPhoneFilter && matchesJobFilter
    })
  }, [candidates, searchTerm, filterStatus, filterJob])

  // Toggle candidate selection
  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  // Select all filtered candidates
  const selectAll = () => {
    const candidatesWithPhone = filteredCandidates.filter(c => c.phone && c.phone.trim() !== '')
    setSelectedCandidates(candidatesWithPhone.map(c => c.id))
  }

  // Deselect all
  const deselectAll = () => {
    setSelectedCandidates([])
  }

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setMessageContent(template.content)
    }
  }

  // Replace variables in template
  const replaceVariables = (content: string, candidate: Record<string, unknown>, job?: Record<string, unknown>) => {
    return content
      .replace(/{{firstName}}/g, candidate.firstName as string)
      .replace(/{{lastName}}/g, candidate.lastName as string)
      .replace(/{{fullName}}/g, `${candidate.firstName} ${candidate.lastName}`)
      .replace(/{{jobTitle}}/g, (job?.title as string) || '[Puesto]')
      .replace(/{{companyName}}/g, 'Elevas RRHH')
      .replace(/{{interviewDate}}/g, '[Fecha de Entrevista]')
      .replace(/{{interviewTime}}/g, '[Hora de Entrevista]')
      .replace(/{{location}}/g, '[Ubicación]')
  }

  // Send messages
  const handleSendMessages = async () => {
    if (!messageContent.trim()) {
      showError('Por favor escribe un mensaje')
      return
    }

    if (selectedCandidates.length === 0) {
      showError('Selecciona al menos un candidato')
      return
    }

    try {
      const selectedCandidatesData = candidates.filter(c => selectedCandidates.includes(c.id))

      // Prepare recipients for API
      const recipients = selectedCandidatesData.map(candidate => {
        const job = jobs.find(j =>
          candidate.applications?.some(app => app.jobId === j.id)
        )

        return {
          candidateId: candidate.id,
          phone: candidate.phone || '',
          message: replaceVariables(messageContent, candidate as unknown as Record<string, unknown>, job as unknown as Record<string, unknown>)
        }
      })

      // Send to backend API
      const response = await api.post('/whatsapp/send', {
        recipients,
        templateId: selectedTemplate || undefined
      })

      // Add to message history
      const newMessages: WhatsAppMessage[] = (response as Record<string, unknown>[]).map((msg: Record<string, unknown>) => ({
        id: msg.id as string,
        candidateId: msg.candidateId as string,
        candidateName: selectedCandidatesData.find(c => c.id === msg.candidateId)
          ? `${selectedCandidatesData.find(c => c.id === msg.candidateId)!.firstName} ${selectedCandidatesData.find(c => c.id === msg.candidateId)!.lastName}`
          : '',
        phone: msg.phone as string,
        message: msg.message as string,
        status: (msg.status as WhatsAppMessage['status']) || 'pending',
        templateId: msg.templateId as string | undefined,
        sentAt: msg.createdAt ? new Date(msg.createdAt as string | Date) : new Date()
      }))

      setMessageHistory(prev => [...newMessages, ...prev])

      showSuccess(`${newMessages.length} mensaje(s) enviado(s) exitosamente`)
      setIsMessageDialogOpen(false)
      setMessageContent('')
      setSelectedTemplate('')
      setSelectedCandidates([])
    } catch (error) {
      showError('Error al enviar mensajes')
      console.error(error)
    }
  }

  // Get statistics
  const stats = useMemo(() => {
    const totalCandidates = candidates.length
    const withPhone = candidates.filter(c => c.phone && c.phone.trim() !== '').length
    const withoutPhone = totalCandidates - withPhone
    const messagesSent = messageHistory.length

    return {
      totalCandidates,
      withPhone,
      withoutPhone,
      messagesSent
    }
  }, [candidates, messageHistory])

  if (candidatesLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-96 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          WhatsApp Business
        </h1>
        <p className="text-gray-600">Envía mensajes masivos a tus candidatos vía WhatsApp</p>
      </div>

      {/* Module in Development Banner */}
      <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Settings className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                Módulo en Desarrollo
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  Beta
                </Badge>
              </h3>
              <p className="text-gray-700 mb-4">
                Este módulo requiere configuración adicional para funcionar. A continuación encontrarás
                las instrucciones para conectar WhatsApp Business API + n8n.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Guide Card */}
      <Card className="mb-6 border-green-200">
        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsSetupGuideOpen(!isSetupGuideOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Info className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Guía de Configuración: WhatsApp Business API + n8n</CardTitle>
                <CardDescription>Paso a paso para activar el envío de mensajes</CardDescription>
              </div>
            </div>
            {isSetupGuideOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </CardHeader>

        {isSetupGuideOpen && (
          <CardContent className="space-y-6 pt-4 border-t">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Obtener WhatsApp Business API</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Necesitas una cuenta de WhatsApp Business API. Tienes dos opciones:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span><strong>Meta Business:</strong> Aplica directamente con Meta (Facebook) para obtener acceso oficial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span><strong>Proveedores BSP:</strong> Usa un proveedor como <strong>360Dialog</strong>, <strong>Twilio</strong>, <strong>MessageBird</strong>, o <strong>Gupshup</strong></span>
                    </li>
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" asChild>
                      <a href="https://business.facebook.com/latest/whatsapp_manager" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Meta Business
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" asChild>
                      <a href="https://www.360dialog.com/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        360Dialog
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Configurar n8n</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    n8n es una herramienta de automatización que conectará tu backend con WhatsApp.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Instala n8n (self-hosted o usa n8n.cloud)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Crea un nuevo workflow en n8n</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Agrega un nodo <strong>Webhook</strong> para recibir datos del backend</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Conecta el nodo de WhatsApp Business API con tus credenciales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Configura el workflow para enviar mensajes y actualizar el estado</span>
                    </li>
                  </ul>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="text-xs" asChild>
                      <a href="https://n8n.io/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        n8n.io
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Configurar Variables de Entorno</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    En tu archivo <code className="px-2 py-1 bg-gray-100 rounded text-xs">.env</code> del backend, agrega:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono">
                    <code>
                      N8N_WHATSAPP_WEBHOOK_URL=https://tu-n8n.com/webhook/whatsapp
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Esta URL es la del webhook que creaste en n8n en el paso anterior.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Reiniciar el Backend</h4>
                  <p className="text-sm text-gray-600">
                    Después de configurar la variable de entorno, reinicia el servidor backend para aplicar los cambios.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono mt-3">
                    <code>
                      npm run start:dev
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Check */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Webhook className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-900 mb-1">Estado de Configuración</h5>
                  <p className="text-sm text-blue-700">
                    Una vez configurado correctamente, el backend enviará automáticamente los mensajes a n8n,
                    que a su vez los enviará vía WhatsApp Business API.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidatos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Teléfono</p>
                <p className="text-3xl font-bold text-green-600">{stats.withPhone}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Teléfono</p>
                <p className="text-3xl font-bold text-orange-600">{stats.withoutPhone}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                <p className="text-3xl font-bold text-purple-600">{stats.messagesSent}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Candidatos</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={filteredCandidates.filter(c => c.phone).length === 0}
                >
                  Seleccionar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedCandidates.length === 0}
                >
                  Deseleccionar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsMessageDialogOpen(true)}
                  disabled={selectedCandidates.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje ({selectedCandidates.length})
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(value: string) => setFilterStatus(value as 'all' | 'with_phone' | 'without_phone')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por teléfono" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with_phone">Con teléfono</SelectItem>
                  <SelectItem value="without_phone">Sin teléfono</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterJob} onValueChange={setFilterJob}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por puesto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los puestos</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No se encontraron candidatos</p>
                </div>
              ) : (
                filteredCandidates.map(candidate => {
                  const hasPhone = candidate.phone && candidate.phone.trim() !== ''
                  const isSelected = selectedCandidates.includes(candidate.id)

                  return (
                    <div
                      key={candidate.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      } ${!hasPhone ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => hasPhone && toggleCandidate(candidate.id)}
                          disabled={!hasPhone}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {candidate.firstName} {candidate.lastName}
                            </p>
                            {!hasPhone && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                Sin teléfono
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{candidate.email}</p>
                          {hasPhone && (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Phone className="h-3 w-3" />
                              <span className="font-medium">{candidate.phone}</span>
                            </div>
                          )}
                          {candidate.applications && candidate.applications.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <Briefcase className="h-3 w-3" />
                              <span>
                                {candidate.applications.length} postulación(es)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Mensajes
            </CardTitle>
            <CardDescription>
              Últimos mensajes enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {messageHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay mensajes enviados</p>
                </div>
              ) : (
                messageHistory.map(msg => (
                  <div key={msg.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{msg.candidateName}</p>
                      <Badge
                        variant="secondary"
                        className={
                          msg.status === 'sent' ? 'bg-green-100 text-green-700' :
                          msg.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }
                      >
                        {msg.status === 'sent' ? <CheckCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {msg.phone}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    {msg.sentAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDateAR(msg.sentAt)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Enviar Mensaje de WhatsApp
            </DialogTitle>
            <DialogDescription>
              Enviar mensaje a {selectedCandidates.length} candidato(s) seleccionado(s)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Template Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Plantilla de Mensaje
              </label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla o escribe tu mensaje" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{template.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Content */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Mensaje
              </label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={10}
                className="font-normal"
              />
              <p className="text-xs text-gray-500 mt-2">
                Variables disponibles: {'{'}{'{'} firstName {'}'}{'}'}, {'{'}{'{'} lastName {'}'}{'}'}, {'{'}{'{'} jobTitle {'}'}{'}'}, {'{'}{'{'} companyName {'}'}{'}'}, {'{'}{'{'} interviewDate {'}'}{'}'}, {'{'}{'{'} interviewTime {'}'}{'}'}, {'{'}{'{'} location {'}'}{'}'}
              </p>
            </div>

            {/* Preview */}
            {messageContent && selectedCandidates.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Vista Previa (primer candidato)
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm whitespace-pre-wrap">
                    {replaceVariables(
                      messageContent,
                      (candidates.find(c => c.id === selectedCandidates[0]) || {}) as unknown as Record<string, unknown>,
                      (jobs[0] || {}) as unknown as Record<string, unknown>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessages}
              className="bg-green-600 hover:bg-green-700"
              disabled={!messageContent.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar {selectedCandidates.length} Mensaje(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
