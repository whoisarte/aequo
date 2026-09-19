import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const paymentIntentSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  currency: z.string().min(3, 'Moneda inválida').max(3, 'Moneda inválida'),
  planId: z.string().min(1, 'El ID del plan es requerido'),
  customerId: z.string().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = paymentIntentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { amount, currency, planId, customerId } = parsed.data

    if (process.env.NEXT_PUBLIC_APP_MODE === 'local') {
      return NextResponse.json({
        sessionId: `mock_session_${Date.now()}`,
        mock: true,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Stripe = (await import('stripe')).default as any
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock', {
      apiVersion: '2026-04-22.dahlia',
    })

    const origin = req.headers.get('origin')
    if (!origin) {
      return NextResponse.json(
        { error: 'No se pudo determinar el origen de la petición.' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Suscripción ${planId}`,
            },
            unit_amount: Math.round(amount),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?canceled=true`,
      customer: customerId,
      metadata: {
        planId: planId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: unknown) {
    console.error('Error en API /create-payment-intent:', error)
    return NextResponse.json(
      { error: `Error al crear la sesión de Checkout: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    )
  }
}
