import { NextResponse } from 'next/server'
import { z } from 'zod'
import { container } from '@/lib/di'
import { rateLimit, getRateLimitKey } from '@/lib/ratelimit'

const chatbotSchema = z.object({
  userMessage: z.string().min(1, 'El mensaje no puede estar vacío').max(4000, 'El mensaje es demasiado largo'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().default([]),
})

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

    const body = await request.json()
    const parsed = chatbotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { userMessage, conversationHistory } = parsed.data

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
