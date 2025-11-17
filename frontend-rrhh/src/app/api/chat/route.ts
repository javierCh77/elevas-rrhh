import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenAIError {
  error?: {
    type?: string
    message?: string
  }
}

function isOpenAIError(error: unknown): error is OpenAIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as OpenAIError).error === 'object'
  )
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar OpenAI dentro de la función para evitar errores en build time
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const body = await request.json()
    const messages = body.messages as ChatMessage[]

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: assistantMessage
    })

  } catch (error: unknown) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('OpenAI API error:', error)
    }

    if (isOpenAIError(error)) {
      if (error.error?.type === 'insufficient_quota') {
        return NextResponse.json(
          { error: 'Quota insuficiente de OpenAI. Por favor verifica tu plan.' },
          { status: 429 }
        )
      }

      if (error.error?.type === 'invalid_api_key') {
        return NextResponse.json(
          { error: 'API key de OpenAI inválida.' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}