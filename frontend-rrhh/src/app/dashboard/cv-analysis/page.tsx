'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, X, FileText, Users, Loader2, Sparkles, User, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useNotification } from '@/hooks/useNotification'
import { api } from '@/lib/api'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachedCVs?: AttachedCV[]
  selectedCVs?: SelectedCV[]
}

interface AttachedCV {
  file: File
  preview?: string
}

interface SelectedCV {
  id: string
  candidateName: string
  fileName: string
  resumeUrl: string
}

interface CandidateWithCV {
  id: string
  fullName: string
  email: string
  fileName: string
  resumeUrl: string
  skills: string[]
  yearsOfExperience?: number
}

export default function CVAnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy EVA, tu asistente de análisis de CVs con IA. Puedo ayudarte a:\n\n• Analizar CVs individuales o múltiples\n• Comparar candidatos entre sí\n• Buscar habilidades específicas\n• Evaluar experiencia y educación\n• Identificar red flags y fortalezas\n\n¿Qué te gustaría hacer hoy?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedCV[]>([])
  const [selectedCVsFromDB, setSelectedCVsFromDB] = useState<SelectedCV[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCVSelector, setShowCVSelector] = useState(false)
  const [availableCVs, setAvailableCVs] = useState<CandidateWithCV[]>([])
  const [loadingCVs, setLoadingCVs] = useState(false)
  const [tempSelectedCVs, setTempSelectedCVs] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    message: string
    model?: string
  } | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success: showSuccess, error: showError } = useNotification()

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check OpenAI connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setCheckingConnection(true)
        const response = await api.get<{ success: boolean; data: { connected: boolean; message: string } }>('/eva/connection-status')
        if (response.success) {
          setConnectionStatus(response.data)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
        setConnectionStatus({
          connected: false,
          message: 'Error al verificar conexión'
        })
      } finally {
        setCheckingConnection(false)
      }
    }

    checkConnection()
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load available CVs from database
  const loadAvailableCVs = async () => {
    setLoadingCVs(true)
    try {
      const response = await api.get<{ success: boolean; data: { candidates: CandidateWithCV[] } }>('/eva/candidates-with-cvs')
      if (response.success) {
        setAvailableCVs(response.data.candidates)
      }
    } catch (error) {
      console.error('Error loading CVs:', error)
      showError('Error al cargar los CVs disponibles')
    } finally {
      setLoadingCVs(false)
    }
  }

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')

    if (pdfFiles.length !== files.length) {
      showError('Solo se permiten archivos PDF')
    }

    const newAttachments: AttachedCV[] = pdfFiles.map(file => ({
      file,
      preview: file.name
    }))

    setAttachedFiles(prev => [...prev, ...newAttachments])
  }

  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Remove selected CV from DB
  const removeSelectedCV = (id: string) => {
    setSelectedCVsFromDB(prev => prev.filter(cv => cv.id !== id))
  }

  // Open CV selector dialog
  const openCVSelector = () => {
    loadAvailableCVs()
    setTempSelectedCVs(selectedCVsFromDB.map(cv => cv.id))
    setShowCVSelector(true)
  }

  // Confirm CV selection
  const confirmCVSelection = () => {
    const selected = availableCVs
      .filter(cv => tempSelectedCVs.includes(cv.id))
      .map(cv => ({
        id: cv.id,
        candidateName: cv.fullName,
        fileName: cv.fileName,
        resumeUrl: cv.resumeUrl
      }))

    setSelectedCVsFromDB(selected)
    setShowCVSelector(false)
    setSearchQuery('')
  }

  // Toggle CV selection in dialog
  const toggleCVSelection = (cvId: string) => {
    setTempSelectedCVs(prev =>
      prev.includes(cvId)
        ? prev.filter(id => id !== cvId)
        : [...prev, cvId]
    )
  }

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachedFiles.length === 0 && selectedCVsFromDB.length === 0) {
      return
    }

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachedCVs: attachedFiles,
      selectedCVs: selectedCVsFromDB
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call EVA chat API
      const token = localStorage.getItem('auth_token')

      // Prepare context with attached files info
      const context: Record<string, unknown> = {}
      if (attachedFiles.length > 0) {
        context.attachedFiles = attachedFiles.map(f => f.file.name)
      }
      if (selectedCVsFromDB.length > 0) {
        context.selectedCVs = selectedCVsFromDB.map(cv => ({
          id: cv.id,
          name: cv.candidateName,
          fileName: cv.fileName
        }))
      }

      const response = await fetch('http://localhost:3000/api/eva/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          context: Object.keys(context).length > 0 ? context : undefined
        })
      })

      const data = await response.json()

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data?.response || data.response || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Clear attachments after sending
      setAttachedFiles([])
      setSelectedCVsFromDB([])

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Generate PDF Report - Save to database and immediately download
  const handleGeneratePDFReport = async (message: Message) => {
    try {
      setIsLoading(true)

      // First save the report to database
      const response = await api.post<{ success: boolean; data: { id: string } }>('/eva/save-chat-report', {
        content: message.content,
        timestamp: message.timestamp,
        attachedCVs: message.attachedCVs?.map(cv => cv.preview) || [],
        selectedCVs: message.selectedCVs?.map(cv => ({
          candidateName: cv.candidateName,
          fileName: cv.fileName,
          candidateId: cv.id
        })) || []
      })

      if (response.success && response.data?.id) {
        // Immediately trigger download
        const token = localStorage.getItem('auth_token')
        const downloadUrl = `http://localhost:3000/api/eva/download-report/${response.data.id}`

        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = downloadUrl
        link.setAttribute('download', `Reporte_EVA_${Date.now()}.pdf`)

        // For authenticated downloads, we need to fetch and create blob
        const downloadResponse = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          link.href = blobUrl
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)

          showSuccess('Reporte generado y descargado exitosamente')
        } else {
          showError('Error al descargar el reporte')
        }
      } else {
        showError('Error al guardar el reporte')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      showError('Error al generar el reporte')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="space-y-6 mt-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
                EVA - Análisis de CVs con IA
              </h1>
              {checkingConnection ? (
                <Badge variant="outline" className="text-xs" style={{
                  borderColor: 'rgba(201, 143, 109, 0.3)',
                  color: '#8B7355'
                }}>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Verificando...
                </Badge>
              ) : connectionStatus?.connected ? (
                <Badge className="text-xs" style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#16a34a',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                  Online
                </Badge>
              ) : (
                <Badge className="text-xs" style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
                  Offline
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base" style={{ color: '#DAA77B' }}>
              Tu asistente inteligente para evaluación de candidatos con inteligencia artificial
            </p>
          </div>
        </div>

      {/* Main Content Area - Chat Only */}
      <div className="flex gap-6">
        {/* Chat Card */}
        <Card className="flex-1 overflow-hidden shadow-lg border-white/50 transition-all duration-300" style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <div className="flex flex-col h-[calc(100vh-220px)]">
          {/* Dynamic Header */}
          <div className="border-b px-6 py-3 flex items-center justify-between flex-shrink-0" style={{
            background: 'rgba(255, 248, 243, 0.8)',
            borderBottom: '1px solid rgba(201, 143, 109, 0.15)'
          }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {isLoading ? 'EVA está analizando...' : 'EVA está lista'}
                </p>
                <p className="text-xs" style={{ color: '#8B7355', opacity: 0.7 }}>
                  {attachedFiles.length + selectedCVsFromDB.length > 0
                    ? `${attachedFiles.length + selectedCVsFromDB.length} CV(s) seleccionado(s)`
                    : 'Adjunta CVs o escribe tu consulta'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-[#C98F6D]/30 text-[#8B7355]">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Activa
              </Badge>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="px-6 py-8 space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{
                animation: 'fadeInUp 0.4s ease-out',
                animationFillMode: 'both',
                animationDelay: `${index * 0.1}s`
              }}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2" style={{ borderColor: '#cfaf6e' }}>
                  <Image src="/avatar.png" alt="EVA" width={32} height={32} className="object-cover" />
                </div>
              )}

              <div className={`flex flex-col gap-1 ${message.role === 'user' ? 'items-end max-w-[75%]' : 'items-start max-w-[85%]'}`}>
                {/* Nombre del remitente */}
                <span className="text-xs font-medium" style={{ color: message.role === 'user' ? '#5a67d8' : '#a37d43' }}>
                  {message.role === 'user' ? 'Tú' : 'EVA'}
                </span>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'text-gray-800'
                      : 'text-gray-900'
                  }`}
                  style={
                    message.role === 'user'
                      ? {
                          background: 'rgba(250, 220, 205, 0.3)',
                          backdropFilter: 'blur(8px)'
                        }
                      : {
                          background: 'rgba(255,255,255,0.7)',
                          backdropFilter: 'blur(10px)',
                          borderLeft: '3px solid #C98F6D',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }
                  }
                >
                  {/* Render message content with improved typography */}
                  {message.id === '1' && message.role === 'assistant' ? (
                    // Welcome message with special formatting
                    <div>
                      <p className="font-semibold text-[0.875rem] mb-2" style={{ lineHeight: '1.4' }}>
                        ¡Hola! Soy EVA, tu asistente de análisis de CVs.
                      </p>
                      <p className="text-[0.8rem] mb-1.5" style={{ lineHeight: '1.4' }}>
                        Puedo ayudarte a:
                      </p>
                      <ul className="text-[0.8rem] space-y-0.5 ml-1" style={{ lineHeight: '1.4' }}>
                        <li>• Analizar y comparar CVs</li>
                        <li>• Buscar habilidades específicas</li>
                        <li>• Evaluar experiencia y educación</li>
                        <li>• Identificar fortalezas y red flags</li>
                      </ul>
                      <p className="text-[0.8rem] mt-2" style={{ lineHeight: '1.4' }}>
                        ¿Qué necesitas analizar?
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-[0.85rem] prose prose-sm max-w-none prose-headings:text-gray-900 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-2 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-2 prose-li:my-0.5" style={{ lineHeight: '1.5' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* Generate PDF Report button - For all assistant messages except welcome */}
                      {message.role === 'assistant' && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(201, 143, 109, 0.2)' }}>
                          <Button
                            onClick={() => handleGeneratePDFReport(message)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            style={{
                              borderColor: 'rgba(201, 143, 109, 0.3)',
                              color: '#C98F6D'
                            }}
                          >
                            <FileDown className="h-3.5 w-3.5 mr-1.5" />
                            Generar Reporte PDF
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Show attached CVs */}
                  {message.attachedCVs && message.attachedCVs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-400/30 space-y-1">
                      {message.attachedCVs.map((cv, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3" />
                          <span>{cv.preview}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show selected CVs from DB */}
                  {message.selectedCVs && message.selectedCVs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-400/30 space-y-1">
                      {message.selectedCVs.map((cv) => (
                        <div key={cv.id} className="flex items-center gap-2 text-xs">
                          <User className="h-3 w-3" />
                          <span>{cv.candidateName} - {cv.fileName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0826D] flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2" style={{ borderColor: '#cfaf6e' }}>
                <Image src="/avatar.png" alt="EVA" width={32} height={32} className="object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium" style={{ color: '#a37d43' }}>
                  EVA
                </span>
                <div className="rounded-2xl px-4 py-3 min-w-[80px]" style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(10px)',
                  borderLeft: '3px solid #C98F6D',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div className="flex space-x-1.5 items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#cfaf6e', animationDuration: '0.6s' }} />
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#cfaf6e', animationDuration: '0.6s', animationDelay: '0.2s' }} />
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#cfaf6e', animationDuration: '0.6s', animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t px-4 py-3 flex-shrink-0" style={{
        background: 'rgba(255, 248, 243, 0.9)',
        borderTop: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div className="max-w-[800px] mx-auto">
          {/* Attached Files & Selected CVs Preview */}
          {(attachedFiles.length > 0 || selectedCVsFromDB.length > 0) && (
            <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
              {/* Attached Files */}
              {attachedFiles.map((file, index) => (
                <Badge
                  key={`file-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 border-blue-200 text-xs"
                >
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs max-w-[120px] sm:max-w-none truncate">{file.preview}</span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="ml-0.5 sm:ml-1 hover:bg-blue-200 rounded-full p-0.5 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {/* Selected CVs from DB */}
              {selectedCVsFromDB.map((cv) => (
                <Badge
                  key={cv.id}
                  variant="secondary"
                  className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-purple-50 text-purple-700 border-purple-200 text-xs"
                >
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs max-w-[120px] sm:max-w-none truncate">{cv.candidateName}</span>
                  <button
                    onClick={() => removeSelectedCV(cv.id)}
                    className="ml-0.5 sm:ml-1 hover:bg-purple-200 rounded-full p-0.5 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-1.5 sm:gap-2">
            {/* Attach File Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-10 w-10 sm:h-10 sm:w-10"
              title="Adjuntar CV"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Select from DB Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={openCVSelector}
              className="flex-shrink-0 h-10 w-10 sm:h-10 sm:w-10"
              title="Seleccionar CVs de la base de datos"
            >
              <Users className="h-4 w-4" />
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta..."
                className="min-h-[52px] max-h-[200px] resize-none pr-14 rounded-xl text-sm border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputMessage.trim() && attachedFiles.length === 0 && selectedCVsFromDB.length === 0)}
                size="icon"
                className="absolute right-2 bottom-2 h-9 w-9 rounded-lg transition-all duration-200 border-0"
                style={{
                  background: 'linear-gradient(135deg, #C98F6D 0%, #D9A96A 100%)',
                  boxShadow: '0 2px 8px rgba(201, 143, 109, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #D9A96A 0%, #E5BA80 100%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #C98F6D 0%, #D9A96A 100%)'
                }}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-center mt-2" style={{ opacity: 0.6, color: '#8B7355' }}>
            EVA puede analizar CVs, comparar candidatos y responder preguntas
          </p>
        </div>
      </div>
        </div>
      </Card>
      </div>

      {/* CV Selector Dialog */}
      <Dialog open={showCVSelector} onOpenChange={setShowCVSelector}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] sm:max-h-[80vh] flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Seleccionar CVs</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Selecciona los CVs que deseas incluir
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar por nombre, email o habilidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {loadingCVs ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-2 sm:pr-4">
              <div className="space-y-2">
                {availableCVs
                  .filter((cv) => {
                    const query = searchQuery.toLowerCase()
                    return (
                      cv.fullName.toLowerCase().includes(query) ||
                      cv.email.toLowerCase().includes(query) ||
                      cv.skills.some(skill => skill.toLowerCase().includes(query))
                    )
                  })
                  .map((cv) => (
                  <div
                    key={cv.id}
                    className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                      tempSelectedCVs.includes(cv.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleCVSelection(cv.id)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Checkbox
                        checked={tempSelectedCVs.includes(cv.id)}
                        onCheckedChange={() => toggleCVSelection(cv.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{cv.fullName}</p>
                          <Badge variant="outline" className="text-[10px] sm:text-xs self-start sm:self-auto">
                            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                            <span className="truncate max-w-[120px]">{cv.fileName}</span>
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 truncate">{cv.email}</p>
                        {cv.yearsOfExperience && (
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">
                            {cv.yearsOfExperience} años de experiencia
                          </p>
                        )}
                        {cv.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cv.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {cv.skills.length > 3 && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                +{cv.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {availableCVs.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                    <p className="text-xs sm:text-sm">No hay CVs disponibles</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t">
            <p className="text-xs sm:text-sm text-gray-600">
              {tempSelectedCVs.length} CV(s) seleccionado(s)
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => {
                setShowCVSelector(false)
                setSearchQuery('')
              }} className="flex-1 sm:flex-none text-sm">
                Cancelar
              </Button>
              <Button onClick={confirmCVSelection} className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-sm">
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
