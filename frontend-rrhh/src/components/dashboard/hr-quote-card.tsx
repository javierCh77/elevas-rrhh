'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Quote, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HRQuote {
  text: string
  author: string
  role: string
  source?: string
}

const hrQuotes: HRQuote[] = [
  {
    text: "El talento gana partidos, pero el trabajo en equipo y la inteligencia ganan campeonatos.",
    author: "Michael Jordan",
    role: "Leyenda del Deporte",
    source: "Aplicado al mundo empresarial"
  },
  {
    text: "Los empleados que se sienten valorados trabajan con un propósito más profundo y una mayor dedicación.",
    author: "Dave Ramsey",
    role: "Experto en Finanzas Empresariales"
  },
  {
    text: "La cultura se come a la estrategia en el desayuno. Un ambiente de trabajo positivo es la base del éxito.",
    author: "Peter Drucker",
    role: "Gurú del Management"
  },
  {
    text: "El verdadero liderazgo no es sobre ser servido, sino sobre servir a otros y ayudarles a crecer.",
    author: "Simon Sinek",
    role: "Autor y Conferencista"
  },
  {
    text: "Las personas no dejan empresas, dejan malos jefes. Invierte en desarrollar líderes excepcionales.",
    author: "Marcus Buckingham",
    role: "Investigador en Fortalezas"
  },
  {
    text: "El compromiso de los empleados es el resultado de crear un ambiente donde las personas se sienten valoradas.",
    author: "Amy Edmondson",
    role: "Profesora Harvard Business School"
  },
  {
    text: "Reclutar es como plantar un jardín: necesitas la semilla correcta, el suelo adecuado y mucho cuidado.",
    author: "Lou Adler",
    role: "CEO The Adler Group"
  },
  {
    text: "La diversidad es invitar a todos a la fiesta; la inclusión es pedirles que bailen.",
    author: "Vernā Myers",
    role: "Estratega en Inclusión"
  },
  {
    text: "El aprendizaje continuo es el combustible del crecimiento profesional y personal.",
    author: "Reid Hoffman",
    role: "Fundador de LinkedIn"
  },
  {
    text: "En RRHH, no gestionamos recursos humanos, cultivamos el potencial humano.",
    author: "Josh Bersin",
    role: "Analista Global de RRHH"
  }
]

export function HRQuoteCard() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Rotar frases cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % hrQuotes.length)
      setLastUpdated(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    const nextIndex = (currentQuoteIndex + 1) % hrQuotes.length
    setCurrentQuoteIndex(nextIndex)
    setLastUpdated(new Date())
  }

  const currentQuote = hrQuotes[currentQuoteIndex]
  const today = new Date()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGreeting = () => {
    const hour = today.getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl bg-white">
      {/* Elegant gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(254, 243, 199, 0.85) 50%, rgba(253, 230, 138, 0.8) 100%)',
        }}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
      </div>

      <CardContent className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl blur-md opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                }}
              ></div>
              <div
                className="relative p-2.5 rounded-xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
                }}
              >
                <Quote className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                {getGreeting()}! 👋
              </h2>
              <p className="text-xs font-medium text-amber-700/80">
                {formatDate(today)}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-amber-700 hover:text-amber-900 hover:bg-white/80 rounded-lg transition-all duration-200 hover:scale-105 h-8 w-8 p-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Quote content */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute -left-1 top-0 text-4xl text-amber-300/30 font-serif leading-none">&quot;</div>
            <blockquote className="text-sm sm:text-base font-medium text-amber-950 leading-snug pl-4">
              {currentQuote.text}
            </blockquote>
            <div className="absolute -right-1 bottom-0 text-4xl text-amber-300/30 font-serif leading-none transform rotate-180">&quot;</div>
          </div>

          <div className="flex items-end justify-between gap-3 pt-2 border-t border-amber-200/50">
            <div>
              <p className="font-bold text-amber-900 text-xs">
                — {currentQuote.author}
              </p>
              <p className="text-xs text-amber-700/90">
                {currentQuote.role}
              </p>
              {currentQuote.source && (
                <p className="text-[10px] text-amber-600/80 italic mt-0.5">
                  {currentQuote.source}
                </p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-amber-600/70">Última actualización</p>
              <p className="text-xs font-semibold text-amber-800">{formatTime(lastUpdated)}</p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 flex space-x-1">
          {hrQuotes.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                index === currentQuoteIndex
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-sm'
                  : 'bg-amber-200/40 hover:bg-amber-300/50'
              }`}
              style={{
                transform: index === currentQuoteIndex ? 'scaleY(1.2)' : 'scaleY(1)',
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}