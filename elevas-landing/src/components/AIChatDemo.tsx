"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  showContactButton?: boolean
}


interface AIChatDemoProps {
  embedded?: boolean
}

export default function AIChatDemo({ embedded = false }: AIChatDemoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const welcomeMessageSent = useRef(false)

  const handleContactClick = () => {
    // Navigate to contact page
    window.location.href = '/contacto'
  }

  const handleWhatsAppClick = () => {
    // Open WhatsApp in new tab
    const whatsappNumber = '+5492901586685'
    const message = encodeURIComponent('Hola! Estuve hablando con EVA y me interesa conocer más sobre los servicios de Elevas.')
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const scrollToBottom = (force: boolean = false) => {
    if (messagesEndRef.current) {
      // Encontrar el contenedor del chat específico
      const chatContainer = messagesEndRef.current.closest('[data-chat-container]')

      if (chatContainer) {
        // Scroll dentro del contenedor del chat, no de la página
        chatContainer.scrollTop = chatContainer.scrollHeight
      } else {
        // Fallback al comportamiento anterior pero más controlado
        if (force) {
          messagesEndRef.current.scrollIntoView({
            behavior: "instant",
            block: "nearest",
            inline: "nearest"
          })
        } else {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
          })
        }
      }
    }
  }

  useEffect(() => {
    // Solo hacer scroll automático cuando se agregan mensajes NUEVOS
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [messages.length])

  useEffect(() => {
    if ((embedded || isOpen) && messages.length === 0 && !welcomeMessageSent.current) {
      welcomeMessageSent.current = true
      // Mensaje de bienvenida automático
      setTimeout(() => {
        addBotMessage("¡Hola! 👋 Soy EVA, el agente de IA de Elevas Consulting. Estoy especializada en recursos humanos y estoy aquí para ayudarte. ¿Qué te gustaría saber?")
      }, 1000)
    }
  }, [embedded, isOpen, messages.length])

  // Efecto para scroll durante streaming - solo si el usuario está cerca del final
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.isBot && lastMessage.content) {
        // Solo hacer scroll si el usuario está cerca del final del chat
        const chatContainer = messagesEndRef.current?.parentElement
        if (chatContainer) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainer
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

          if (isNearBottom) {
            scrollToBottom()
          }
        }
      }
    }
  }, [messages])

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const addBotMessage = (content: string, showContactButton?: boolean) => {
    const botMessage: Message = {
      id: generateId() + "-bot",
      content,
      isBot: true,
      timestamp: new Date(),
      showContactButton
    }
    setMessages(prev => [...prev, botMessage])
  }

  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: generateId() + "-user",
      content,
      isBot: false,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
  }

  const getBotResponseStream = async (userInput: string, onChunk: (chunk: string) => void): Promise<{response: string, showContactButton?: boolean}> => {
    try {
      // Construir historial de conversación para el API
      const conversationHistory = messages.map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: conversationHistory
        }),
      })

      if (!response.ok) {
        // Fallback cuando la API no está disponible
        return {
          response: "Lo siento, el servicio de chat inteligente no está disponible en este momento. Sin embargo, puedo ayudarte de otras formas:\n\n• Puedes contactarnos directamente por WhatsApp\n• Visitar nuestra página de contacto\n• O llamarnos al +54 9 (2901) 586685\n\n¿Te gustaría que te conecte con nuestro equipo?",
          showContactButton: true
        }
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        // Fallback cuando no hay streaming disponible
        return {
          response: "El servicio de chat está disponible pero con funcionalidad limitada.\n\nTe recomiendo contactarnos directamente:\n\n• WhatsApp: +54 9 (2901) 586685\n• Email: info@elevasconsulting.com\n\n¿Prefieres que te conecte por WhatsApp?",
          showContactButton: true
        }
      }

      let fullResponse = ""
      let showContactButton = false

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'chunk') {
                fullResponse += data.content
                onChunk(data.content)
              } else if (data.type === 'complete') {
                showContactButton = data.showContactButton
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch {
              // Ignorar errores de parsing de chunks malformados
            }
          }
        }
      }

      return {
        response: fullResponse,
        showContactButton: showContactButton
      }
    } catch (error) {
      return {
        response: "Lo siento, hubo un error de conexión. Por favor, intenta nuevamente."
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userInput = inputValue.trim()

    // Validar límite de 300 caracteres
    if (userInput.length > 300) {
      alert("El mensaje no puede exceder los 300 caracteres")
      inputRef.current?.focus()
      return
    }

    setInputValue("")

    // Mantener el foco en el input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    // Agregar mensaje del usuario
    addUserMessage(userInput)

    // Scroll suave al nuevo mensaje del usuario
    setTimeout(() => scrollToBottom(), 50)

    // Inicializar ID del mensaje del bot
    const botMessageId = Date.now().toString()

    try {

      // Crear mensaje del bot vacío para el streaming
      const botMessage: Message = {
        id: botMessageId,
        content: "",
        isBot: true,
        timestamp: new Date(),
        showContactButton: false
      }

      setMessages(prev => [...prev, botMessage])

      const botResponse = await getBotResponseStream(userInput, (chunk: string) => {
        // Actualizar el mensaje del bot con cada chunk
        setMessages(prev => prev.map(msg =>
          msg.id === botMessageId
            ? { ...msg, content: msg.content + chunk }
            : msg
        ))
      })

      // Limpiar el texto y actualizar con la información de contacto final
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? {
              ...msg,
              content: msg.content.replace('[MOSTRAR_CONTACTO]', '').trim(),
              showContactButton: botResponse.showContactButton
            }
          : msg
      ))
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? {
              ...msg,
              content: "Lo siento, estoy experimentando dificultades técnicas en este momento. 😔\n\nPero no te preocupes, puedes:\n\n• Contactarnos por WhatsApp (haz clic abajo)\n• Llamarnos al +54 9 (2901) 586685\n• Enviarnos un email a info@elevasconsulting.com\n\n¡Nuestro equipo está listo para ayudarte!",
              showContactButton: true
            }
          : msg
      ))
    }
  }

  if (embedded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-4xl mx-auto border-[#6d381a]/10 bg-white rounded-2xl overflow-hidden elevas-shadow-xl elevas-lift">
          <CardHeader className="border-b border-[#6d381a]/10 bg-gradient-to-r from-[#f1df96]/30 to-[#e4b53b]/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e4b53b]/10 border-2 border-[#e4b53b]/30 elevas-shadow-sm">
                <Image
                  src="/avatar.png"
                  alt="EVA - Agente IA de Elevas"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <CardTitle className="text-lg font-medium text-[#6d381a] elevas-heading">
                  EVA - Agente IA de Elevas
                </CardTitle>
                <p className="text-sm text-[#6d381a]/70 elevas-body">
                  Especializada en RRHH • Disponible 24/7
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col">
            <div className="overflow-y-auto p-6 space-y-4 h-64 sm:h-80 max-h-64 sm:max-h-80 scrollbar-thin scrollbar-thumb-[#e4b53b] scrollbar-track-[#f1df96]/30" data-chat-container>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`${message.isBot ? 'w-8 h-8 rounded-full overflow-hidden bg-[#e4b53b]/10 border border-[#e4b53b]/30 flex-shrink-0' : 'p-2 rounded-full bg-[#e4b53b]/20 flex-shrink-0'}`}>
                      {message.isBot ? (
                        <Image
                          src="/avatar.png"
                          alt="EVA"
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-[#6d381a]" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm ${
                        message.isBot
                          ? 'bg-[#f1df96]/50 text-[#6d381a] border border-[#e4b53b]/20'
                          : 'bg-[#e4b53b] text-white'
                      }`}
                    >
                      {message.content}
                      {message.isBot && message.content && (
                        <span className="inline-block w-0.5 h-4 bg-[#e4b53b] ml-1 animate-pulse"></span>
                      )}
                      {message.isBot && message.showContactButton && (
                        <div className="mt-3 space-y-2">
                          <Button
                            onClick={handleContactClick}
                            className="bg-[#6d381a] hover:bg-[#6d381a]/90 text-white text-sm px-4 py-2 rounded-lg w-full"
                          >
                            📝 Completar formulario
                          </Button>
                          <Button
                            onClick={handleWhatsAppClick}
                            className="bg-[#25d366] hover:bg-[#25d366]/90 text-white text-sm px-4 py-2 rounded-lg w-full"
                          >
                            💬 WhatsApp directo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-6 border-t border-[#6d381a]/10 bg-[#f1df96]/20">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregúntame sobre nuestros servicios de RRHH... (máx. 300 caracteres)"
                  className="flex-1 text-sm border-[#6d381a]/20 focus:border-[#e4b53b]"
                  maxLength={300}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-[#e4b53b] hover:bg-[#e4b53b]/90 px-6 rounded-xl elevas-press elevas-shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-[#6d381a]/60 mt-3 text-center elevas-body">
                Asistente IA especializado en recursos humanos
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full h-full">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full h-full"
          >
            <Card className="w-full h-full shadow-2xl border-[#6d381a]/20 elevas-glass">
              <CardHeader className="border-b border-elevas-neutral-100 bg-gradient-to-r from-elevas-primary-50 to-elevas-accent-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e4b53b]/10 border border-[#e4b53b]/30">
                      <Image
                        src="/avatar.png"
                        alt="EVA"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-elevas-neutral-800">
                        EVA - Agente IA de Elevas
                      </CardTitle>
                      <p className="text-xs text-elevas-neutral-600">
                        Siempre disponible
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64" data-chat-container>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`${message.isBot ? 'w-6 h-6 rounded-full overflow-hidden bg-[#e4b53b]/10 border border-[#e4b53b]/30 flex-shrink-0' : 'p-1.5 rounded-full bg-elevas-accent-100 flex-shrink-0'}`}>
                          {message.isBot ? (
                            <Image
                              src="/avatar.png"
                              alt="EVA"
                              width={24}
                              height={24}
                              className="w-6 h-6 object-cover"
                            />
                          ) : (
                            <User className="h-3 w-3 text-elevas-accent-600" />
                          )}
                        </div>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm ${
                            message.isBot
                              ? 'bg-elevas-neutral-100 text-elevas-neutral-800'
                              : 'bg-elevas-primary-500 text-white'
                          }`}
                        >
                          {message.content}
                          {message.isBot && message.content && (
                            <span className="inline-block w-0.5 h-3 bg-elevas-primary-500 ml-1 animate-pulse"></span>
                          )}
                          {message.isBot && message.showContactButton && (
                            <div className="mt-2 space-y-1">
                              <Button
                                onClick={handleContactClick}
                                size="sm"
                                className="bg-elevas-accent-500 hover:bg-elevas-accent-600 text-white text-xs px-3 py-1 w-full"
                              >
                                📝 Completar formulario
                              </Button>
                              <Button
                                onClick={handleWhatsAppClick}
                                size="sm"
                                className="bg-[#25d366] hover:bg-[#25d366]/90 text-white text-xs px-3 py-1 w-full"
                              >
                                💬 WhatsApp directo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-elevas-neutral-100">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Escribe tu consulta... (máx. 300 caracteres)"
                      className="flex-1 text-sm"
                      maxLength={300}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputValue.trim()}
                      className="bg-elevas-primary-500 hover:bg-elevas-primary-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Button - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="h-14 w-14 rounded-full bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white elevas-lift elevas-press elevas-shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </motion.div>
        
        {/* Notification indicator */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-elevas-accent-400 rounded-full flex items-center justify-center"
          >
            <div className="h-2 w-2 bg-white rounded-full elevas-pulse-soft"></div>
          </motion.div>
        )}
      </div>
    </div>
  )
}