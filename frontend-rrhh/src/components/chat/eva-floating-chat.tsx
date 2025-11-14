'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  X,
  Send,
  User,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function EvaFloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy EVA, tu asistente de RRHH. ¿En qué puedo ayudarte hoy?',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Eres EVA, un asistente especializado en RRHH y reclutamiento. Tu objetivo es ayudar a los profesionales de recursos humanos con:
- Análisis de CVs y perfiles de candidatos
- Sugerencias para procesos de selección
- Redacción de ofertas de trabajo
- Políticas y procedimientos de RRHH
- Evaluación de competencias
- Consejos sobre entrevistas
- Análisis de métricas de reclutamiento

Responde de manera profesional, concisa y práctica. Siempre enfócate en brindar valor agregado para decisiones de RRHH.`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: content.trim()
            }
          ]
        })
      })

      if (!response.ok) {
        setIsConnected(false)
        throw new Error('Error al comunicarse con EVA')
      }

      setIsConnected(true)
      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      setIsConnected(false)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#cfaf6e',
            borderColor: '#cfaf6e'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#a37d43'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#cfaf6e'
          }}
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card
          className={cn(
            "fixed right-6 bottom-6 shadow-2xl z-50 transition-all duration-300 border-2",
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          )}
          style={{
            borderColor: '#cfaf6e',
            background: 'linear-gradient(180deg, rgba(254, 252, 245, 0.98) 0%, rgba(253, 247, 230, 0.95) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between p-4 cursor-pointer",
              !isMinimized && "border-b"
            )}
            style={{ borderColor: '#cfaf6e40' }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2" style={{ borderColor: '#cfaf6e' }}>
                  <Image src="/avatar.png" alt="EVA" width={40} height={40} className="object-cover" />
                </div>
                <div
                  className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )}
                  title={isConnected ? "Conectado" : "Desconectado"}
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#a37d43' }}>
                  EVA - Asistente RRHH
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Escribiendo...' : isConnected ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(!isMinimized)
                }}
                className="w-8 h-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 h-[460px]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col",
                        message.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "flex items-start space-x-3",
                        message.role === 'user' ? "flex-row-reverse space-x-reverse" : ""
                      )}>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                            message.role === 'user'
                              ? "bg-elevas-primary-100"
                              : "border-2"
                          )}
                          style={message.role === 'assistant' ? { borderColor: '#cfaf6e' } : {}}
                        >
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-elevas-primary-700" />
                          ) : (
                            <Image src="/avatar.png" alt="EVA" width={32} height={32} className="object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium mb-1" style={{ color: message.role === 'user' ? '#5a67d8' : '#a37d43' }}>
                            {message.role === 'user' ? 'Tú' : 'EVA'}
                          </span>
                          <div
                            className={cn(
                              "max-w-[280px] rounded-lg p-3 text-sm",
                              message.role === 'user'
                                ? "bg-elevas-primary-100 text-elevas-primary-900"
                                : "bg-white/80 border border-elevas-bronze-200"
                            )}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {message.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex flex-col items-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2" style={{ borderColor: '#cfaf6e' }}>
                          <Image src="/avatar.png" alt="EVA" width={32} height={32} className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium mb-1" style={{ color: '#a37d43' }}>
                            EVA
                          </span>
                          <div className="bg-white/80 border border-elevas-bronze-200 rounded-lg px-4 py-3 min-w-[60px]">
                            <div className="flex space-x-1.5 items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#cfaf6e', animationDuration: '0.6s' }} />
                              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#cfaf6e', animationDuration: '0.6s', animationDelay: '0.2s' }} />
                              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#cfaf6e', animationDuration: '0.6s', animationDelay: '0.4s' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: '#cfaf6e40' }}>
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Pregunta algo a EVA..."
                    disabled={isLoading}
                    className="flex-1 border-elevas-bronze-300 focus:border-elevas-bronze-500"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    size="sm"
                    className="px-3"
                    style={{
                      backgroundColor: '#cfaf6e',
                      borderColor: '#cfaf6e'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#a37d43'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#cfaf6e'
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}