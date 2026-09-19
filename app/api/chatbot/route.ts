import { NextResponse } from 'next/server'
import { container } from '@/lib/di'
import { rateLimit, getRateLimitKey } from '@/lib/ratelimit'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const ratelimit = rateLimit(getRateLimitKey(ip, '/api/chatbot'), {
      maxRequests: 20,
      windowMs: 60000,
    })

    if (!ratelimit.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Por favor espera un momento.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((ratelimit.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { userMessage, conversationHistory } = await request.json()

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Mensaje inválido.' }, { status: 400 })
    }

    const result = await container.chatbot.sendMessage(userMessage, conversationHistory)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error: unknown) {
    console.error('Error en chatbot API route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener respuesta.' },
      { status: 500 }
    )
  }
}
