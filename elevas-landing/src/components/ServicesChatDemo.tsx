"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

const serviceResponses = [
  {
    trigger: ["atracción", "selección", "reclutamiento", "candidatos", "contratación"],
    response: "**Atracción y Selección de Talento** 🎯\n\nNuestro proceso combina IA avanzada con expertise humano:\n\n• **Análisis predictivo** de perfiles ideales\n• **Screening automatizado** con validación humana\n• **Evaluación 360°** de competencias técnicas y culturales\n• **Reducción del 40%** en tiempo de contratación\n\n¿Te interesa conocer cómo podemos optimizar tu proceso de selección?",
    suggestions: ["¿Qué tecnologías de IA usan?", "¿Cómo miden la compatibilidad cultural?", "Necesito contratar desarrolladores"]
  },
  {
    trigger: ["capacitación", "formación", "desarrollo", "talento", "training"],
    response: "**Gestión del Talento y Capacitación** 🚀\n\nTransformamos el desarrollo profesional con:\n\n• **Planes personalizados** basados en gaps de competencias\n• **Microlearning inteligente** adaptado al rol\n• **Tracking de progreso** con métricas en tiempo real\n• **ROI medible** en desarrollo de habilidades\n\n¿Qué desafíos tienes actualmente en el desarrollo de tu equipo?",
    suggestions: ["¿Ofrecen capacitación en IA?", "¿Cómo miden el ROI del training?", "Necesito upskilling técnico"]
  },
  {
    trigger: ["compensaciones", "sueldos", "salarios", "beneficios", "legal", "nómina"],
    response: "**Compensaciones y Marco Legal** 💼\n\nGestión integral y automatizada:\n\n• **Benchmarking salarial** con data actualizada\n• **Automatización de nómina** libre de errores\n• **Compliance legal** al 100%\n• **Reportes ejecutivos** en tiempo real\n\n¿Necesitas asesoría en estructura salarial o tienes consultas de compliance?",
    suggestions: ["¿Hacen benchmarking salarial?", "¿Qué incluye el compliance?", "Necesito automatizar la nómina"]
  },
  {
    trigger: ["clima", "cultura", "ambiente", "satisfacción", "engagement"],
    response: "**Clima y Cultura Organizacional** 🌟\n\nMedimos y mejoramos tu ambiente laboral:\n\n• **Encuestas inteligentes** con análisis de sentiment\n• **Dashboards en tiempo real** de métricas de clima\n• **Planes de acción** basados en data\n• **Predicción de rotación** con alertas tempranas\n\n¿Cómo está el clima actual en tu organización?",
    suggestions: ["¿Cómo miden la satisfacción?", "¿Predicen la rotación?", "Tenemos problemas de clima"]
  },
  {
    trigger: ["onboarding", "incorporación", "nuevos empleados", "inducción"],
    response: "**Onboarding y Transiciones Laborales** 🎯\n\nExperiencias de integración excepcionales:\n\n• **Journeys digitales** personalizados\n• **Seguimiento automático** de progreso\n• **Feedback loops** continúos\n• **Reducción del 60%** en rotación temprana\n\n¿Cuántas personas incorporas mensualmente? ¿Qué desafíos tienes?",
    suggestions: ["¿Qué incluye el onboarding digital?", "¿Cómo reducen la rotación temprana?", "Necesito mejorar la integración"]
  },
  {
    trigger: ["feedback", "desempeño", "evaluación", "performance", "objetivos"],
    response: "**Feedback y Desarrollo del Desempeño** 📊\n\nSistema continuo de evaluación y crecimiento:\n\n• **OKRs inteligentes** con tracking automático\n• **Feedback 360°** con IA de análisis\n• **Planes de desarrollo** personalizados\n• **Alertas proactivas** de oportunidades de mejora\n\n¿Qué sistema de evaluación usan actualmente?",
    suggestions: ["¿Cómo funciona el feedback 360°?", "¿Integran OKRs?", "Necesito evaluar mejor el performance"]
  },
  {
    trigger: ["outsourcing", "tercerización", "externalización", "subcontratación"],
    response: "**Outsourcing de Recursos Humanos** 🤝\n\nTu departamento de RRHH extendido:\n\n• **Servicios modulares** según necesidad\n• **Equipos especializados** dedicados\n• **Tecnología de punta** incluida\n• **Escalabilidad total** según crecimiento\n\n¿Qué procesos te gustaría tercerizar? ¿Tienes un equipo interno de RRHH?",
    suggestions: ["¿Qué incluye el outsourcing completo?", "¿Pueden manejar solo reclutamiento?", "¿Cómo funciona la integración?"]
  },
  {
    trigger: ["evaluaciones", "psicotécnicas", "competencias", "assessment", "tests"],
    response: "**Evaluaciones Psicotécnicas y por Competencias** 🧠\n\nAnálisis profundo de potencial humano:\n\n• **Tests psicométricos** validados científicamente\n• **Assessment centers** virtuales\n• **Mapeo de competencias** con IA\n• **Reportes predictivos** de desempeño futuro\n\n¿Para qué posiciones necesitas evaluaciones? ¿Buscas detectar potencial o validar fit?",
    suggestions: ["¿Qué tests psicométricos usan?", "¿Hacen assessment virtuales?", "¿Cómo predicen el desempeño?"]
  },
  {
    trigger: ["precios", "costos", "tarifas", "presupuesto", "cotización"],
    response: "**Inversión en Servicios de RRHH** 💡\n\nNuestros precios se adaptan a cada realidad:\n\n• **Consultoría gratuita** para entender necesidades\n• **Pricing flexible** por proyecto o mensual\n• **ROI garantizado** en implementaciones\n• **Sin compromisos** a largo plazo\n\n¿Te gustaría agendar una sesión para analizar tu caso específico?",
    suggestions: ["Agendar consulta gratuita", "¿Tienen planes mensuales?", "¿Cuál es el ROI típico?"]
  },
  {
    trigger: ["ia", "inteligencia artificial", "tecnología", "automatización", "ai"],
    response: "**Tecnología e IA en RRHH** 🤖\n\nPioneeros en RRHH + Inteligencia Artificial:\n\n• **Machine Learning** para matching de perfiles\n• **NLP avanzado** para análisis de CVs y feedback\n• **Algoritmos predictivos** de rotación y performance\n• **Automatización inteligente** de procesos repetitivos\n\n¿Te interesa una demo de nuestras capacidades de IA?",
    suggestions: ["Ver demo de IA", "¿Cómo funciona el matching?", "¿Qué predicen los algoritmos?"]
  }
]

export default function ServicesChatDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mensaje de bienvenida automático
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "¡Hola! 👋 Soy **Elevas AI**, tu consultor especializado en servicios de RRHH.\n\n¿Sobre qué servicio te gustaría conocer más? Puedo ayudarte con:\n\n• Atracción y selección de talento\n• Capacitación y desarrollo\n• Compensaciones y legal\n• Clima organizacional\n• Y mucho más...",
          ["¿Cómo funciona la selección con IA?", "Necesito mejorar el clima laboral", "¿Qué incluye el outsourcing?"]
        )
      }, 1000)
    }
  }, [messages.length])

  const addBotMessage = (content: string, newSuggestions: string[] = []) => {
    const botMessage: Message = {
      id: Date.now().toString() + "-bot",
      content,
      isBot: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, botMessage])
    setSuggestions(newSuggestions)
  }

  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content,
      isBot: false,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
  }

  const getBotResponse = (userInput: string): { response: string; suggestions: string[] } => {
    const input = userInput.toLowerCase()
    
    for (const serviceData of serviceResponses) {
      if (serviceData.trigger.some(trigger => input.includes(trigger))) {
        return {
          response: serviceData.response,
          suggestions: serviceData.suggestions || []
        }
      }
    }
    
    // Respuesta por defecto
    return {
      response: "Excelente pregunta. Nuestro equipo especializado puede darte una respuesta detallada sobre ese tema específico.\n\n¿Te gustaría que te contactemos para profundizar en tu consulta? También puedes preguntarme sobre nuestros servicios principales.",
      suggestions: ["Contactar con el equipo", "Ver todos los servicios", "¿Ofrecen consultas gratuitas?"]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userInput = inputValue.trim()
    setInputValue("")
    setSuggestions([])
    
    // Agregar mensaje del usuario
    addUserMessage(userInput)
    
    // Simular "typing"
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      const { response, suggestions: newSuggestions } = getBotResponse(userInput)
      addBotMessage(response, newSuggestions)
    }, 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue("")
    setSuggestions([])
    addUserMessage(suggestion)
    
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const { response, suggestions: newSuggestions } = getBotResponse(suggestion)
      addBotMessage(response, newSuggestions)
    }, 1500)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-elevas-primary-50/30 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-elevas-primary-500" />
            <h2 className="text-3xl font-light text-elevas-neutral-800">
              Consulta con <span className="elevas-gradient-text font-medium">Elevas AI</span>
            </h2>
            <Sparkles className="h-6 w-6 text-elevas-accent-400" />
          </div>
          <p className="text-lg text-elevas-neutral-600 font-light max-w-2xl mx-auto">
            Pregúntale a nuestro asistente especializado sobre cualquier servicio de RRHH.
            Está entrenado con toda nuestra experiencia y metodologías.
          </p>
        </motion.div>

        <Card className="shadow-xl border-elevas-neutral-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-elevas-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-elevas-primary-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${!message.isBot ? 'order-first' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl ${
                        message.isBot
                          ? 'bg-elevas-neutral-50 border border-elevas-neutral-200'
                          : 'bg-elevas-primary-500 text-white'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content.split('**').map((part, index) => 
                          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-elevas-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-elevas-accent-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-elevas-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-elevas-primary-600" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="p-4 rounded-2xl bg-elevas-neutral-50 border border-elevas-neutral-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-elevas-neutral-400 rounded-full elevas-typing-indicator"></div>
                        <div className="w-2 h-2 bg-elevas-neutral-400 rounded-full elevas-typing-indicator" style={{animationDelay: "0.2s"}}></div>
                        <div className="w-2 h-2 bg-elevas-neutral-400 rounded-full elevas-typing-indicator" style={{animationDelay: "0.4s"}}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-6 pb-4"
              >
                <p className="text-xs text-elevas-neutral-500 mb-3">Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs border-elevas-primary-200 text-elevas-primary-700 hover:bg-elevas-primary-50 h-8"
                    >
                      {suggestion}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
            
            <div className="p-6 border-t border-elevas-neutral-100 bg-elevas-neutral-50/50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregúntame sobre nuestros servicios de RRHH..."
                  className="flex-1 border-elevas-neutral-200 focus:border-elevas-primary-300"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-elevas-primary-500 hover:bg-elevas-primary-600 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-elevas-neutral-500 mt-2 text-center">
                Asistente IA entrenado con metodologías Elevas • Respuestas especializadas en RRHH
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}