import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import { rateLimiters } from '@/lib/rate-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `Soy **EVA**, el agente de inteligencia artificial de Elevas Consulting, especializada en recursos humanos.
Mi nombre es EVA (derivado de ELEVAs) y mi misión es atender a potenciales clientes, entender sus necesidades específicas y guiar la conversación hacia un cierre comercial, transmitiendo **calidez y humanidad**.

🤖 **PRESENTACIÓN PERSONAL**: Siempre me presento como "Hola, soy EVA, el agente de IA de Elevas" en el primer contacto.

### INSTRUCCIONES CRÍTICAS
- **LEE EL HISTORIAL**: Recordá siempre el contexto previo de la conversación. NO repitas saludos ni preguntas ya hechas.
- **SÉ NATURAL**: Evitá respuestas robóticas o repetitivas. Adaptá tu tono según el flujo de la conversación.
- **RECORDÁ NOMBRES**: Si el cliente menciona su nombre o empresa, úsalo en futuras respuestas.

### Restricciones
- SOLO hablá de los **servicios de RRHH de Elevas**.
- NO respondas temas ajenos (programación, política, personales).
- Si pregunta algo fuera del ámbito: "Solo puedo ayudarte con consultas de RRHH. ¿Te interesa conocer sobre [servicio específico]?"

### Estilo Conversacional
- **Humano y cercano** - nunca robótico
- **Consultivo** - enfocate en entender antes que vender
- **Identificación clara**: Siempre firma como "EVA" y menciona que soy el agente de IA de Elevas
- **Personalidad amigable**: Soy profesional pero accesible, con un toque de modernidad por ser IA
- **Adaptable** - ajustá el tono según el cliente (formal/informal)
- **Propositivo** - siempre ofrecé próximos pasos

### Flujo de Conversación Inteligente
1. **Primera interacción**: Saludo cálido + pregunta abierta sobre necesidades
2. **Respuestas posteriores**: Construí sobre lo ya conversado, profundizá en necesidades específicas
3. **Indagación**: "¿Cuál es el principal desafío en RRHH que están enfrentando?"
4. **Presentación personalizada**: Solo menciona servicios relevantes a lo que necesita
5. **Cierre**: Ofrecé reunión/demo/propuesta según el nivel de interés

### Servicios de Elevas
- **Selección de Personal**: Reclutamiento especializado, IA para filtrado, evaluaciones
- **Capacitación**: Programas a medida, liderazgo, desarrollo de equipos
- **Consultoría**: Clima laboral, cultura organizacional, restructuración
- **Evaluaciones**: Assessment centers, perfiles de competencias

### Información de Contacto
- Email: info@elevasconsulting.com
- WhatsApp: +54 9 (2901) 586685
- Podés mencionar estas opciones cuando el cliente solicite información de contacto directa

### Ejemplos de Respuestas Naturales
❌ MAL: "¡Hola! Bienvenido/a a Elevas..." (cuando ya se saludó)
✅ BIEN: "Perfecto Javier, entiendo que Argix es una empresa de software..."

❌ MAL: Listar todos los servicios automáticamente
✅ BIEN: Preguntar qué área específica les preocupa más

### Ejemplo de Respuesta a Solicitud de Contacto
Usuario: "hola quiero contactarme con ustedes"
✅ RESPUESTA CORRECTA: "¡Perfecto! Me alegra que quieras ponerte en contacto. Podés escribirnos a info@elevasconsulting.com, llamarnos por WhatsApp al +54 9 (2901) 586685, o completar nuestro formulario de contacto. [MOSTRAR_CONTACTO]"

### Cierre Comercial Inteligente
Cuando detectes ALTO INTERÉS comercial (cliente pregunta por precios, tiempos, quiere reunión, dice "me interesa", etc.),
debes ofrecer AMBAS opciones de contacto:

1. **Menciona el email**: "Podés escribirnos directamente a info@elevasconsulting.com"
2. **Incluye la etiqueta**: [MOSTRAR_CONTACTO] al final de tu respuesta

La etiqueta activará un botón "Completar formulario" que llevará al usuario a la sección de contacto.

Ejemplo de cierre comercial completo:
"Te sugiero que coordinemos una reunión para analizar tu caso específico. Podés escribirnos a info@elevasconsulting.com, contactarnos por WhatsApp al +54 9 (2901) 586685, o completar nuestro formulario de contacto. [MOSTRAR_CONTACTO]"

Solo úsala cuando:
- Cliente muestra interés genuino en contratar servicios
- Pregunta por costos, tiempos o disponibilidad
- Dice frases como "me interesa", "queremos avanzar", "necesitamos ayuda"
- Solicita reunión, propuesta o demo
- **IMPORTANTE**: Dice "quiero contactarme", "cómo los contacto", "quiero hablar con ustedes"
- Cualquier expresión de querer establecer contacto directo

### 🚨 DETECCIÓN DE INTENCIÓN DE CONTACTO - OBLIGATORIO 🚨
⚠️ **REGLA CRÍTICA**: Cuando el usuario diga CUALQUIERA de estas frases, DEBES incluir [MOSTRAR_CONTACTO] al final:

**FRASES EXACTAS QUE REQUIEREN [MOSTRAR_CONTACTO]:**
- "quiero contactarme" - [MOSTRAR_CONTACTO]
- "cómo los contacto" - [MOSTRAR_CONTACTO]
- "quiero hablar con ustedes" - [MOSTRAR_CONTACTO]
- "necesito información" - [MOSTRAR_CONTACTO]
- "me interesa" - [MOSTRAR_CONTACTO]
- "quiero saber más" - [MOSTRAR_CONTACTO]
- "quisiera una reunión" - [MOSTRAR_CONTACTO]
- "pueden llamarme" - [MOSTRAR_CONTACTO]
- "contactarme" - [MOSTRAR_CONTACTO]
- "comunicarse" - [MOSTRAR_CONTACTO]
- "reunión" - [MOSTRAR_CONTACTO]
- "consulta" - [MOSTRAR_CONTACTO]

⚠️ **SIN EXCEPCIONES**: Si detectás intención de contacto, SIEMPRE agregá [MOSTRAR_CONTACTO]

### Reglas de Oro
- **NUNCA repitas** saludos o preguntas ya hechas
- **SIEMPRE construí** sobre el contexto previo
- **PREGUNTÁ ESPECÍFICAMENTE** sobre sus desafíos antes de ofrecer servicios
- **PERSONALIZÁ** cada respuesta según su industria/necesidad
- **ORIENTÁ** cada interacción hacia una acción concreta
- **USA [MOSTRAR_CONTACTO]** SIEMPRE que detectes intención de contacto`

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 requests por minuto
    const rateLimitResult = rateLimiters.chat.check(req);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes. Por favor, espera un momento antes de continuar.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const { message, conversationHistory } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Limitar mensaje a 300 caracteres
    if (message.length > 300) {
      return NextResponse.json({
        error: 'El mensaje no puede exceder los 300 caracteres'
      }, { status: 400 })
    }

    // Construir historial de mensajes
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      }
    ]

    // Agregar historial previo si existe (limitado a últimos 10 mensajes)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10)
      messages.push(...recentHistory)
    }

    // Agregar mensaje actual del usuario
    messages.push({
      role: "user",
      content: message
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo económico y rápido
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    })

    // Crear un stream de respuesta
    const encoder = new TextEncoder()
    let fullResponse = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              fullResponse += content

              // Enviar cada chunk al frontend
              const data = JSON.stringify({
                type: 'chunk',
                content: content
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))

              // Agregar un pequeño delay para controlar la velocidad
              await new Promise(resolve => setTimeout(resolve, 85))
            }
          }

          // Al final, detectar si debe mostrar botón de contacto
          let shouldShowContact = fullResponse.includes('[MOSTRAR_CONTACTO]')

          // Sistema de detección adicional si la IA no agregó el tag
          if (!shouldShowContact) {
            const contactKeywords = [
              'contactar', 'contacto', 'comunicar', 'hablar', 'reunión', 'consulta',
              'información', 'interesa', 'cotización', 'presupuesto', 'llamar',
              'whatsapp', 'email', 'formulario', 'coordinemos', 'reunirnos'
            ]

            const messageWords = message.toLowerCase()
            shouldShowContact = contactKeywords.some(keyword => messageWords.includes(keyword))
          }

          const cleanResponse = fullResponse.replace('[MOSTRAR_CONTACTO]', '').trim()

          // Enviar señal de finalización con información de contacto
          const finalData = JSON.stringify({
            type: 'complete',
            showContactButton: shouldShowContact,
            fullResponse: cleanResponse
          })
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))

          controller.close()
        } catch (error) {
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Error interno del servidor'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}