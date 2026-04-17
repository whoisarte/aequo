// Importaciones necesarias para Next.js API Routes y Stripe/Supabase
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'; // Mantenemos si Supabase aún se usa para datos de plan/usuario

// Inicializar el cliente de Stripe con la clave secreta (debe estar en .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-04-10', // Eliminado por el error de tipado anterior, usa la versión por defecto
});

// Inicializar el cliente de Supabase (si necesitas leer datos del lado del servidor)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @description Crea una Checkout Session en Stripe para procesar un pago de suscripción o único.
 *              Se espera que el cuerpo de la petición contenga información sobre el pago,
 *              como el monto, la moneda y el ID del plan.
 * @param {NextRequest} req La petición HTTP entrante.
 * @returns {NextResponse} Una respuesta JSON con el sessionId de la Checkout Session
 *                         o un mensaje de error.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { amount, currency, planId, customerId } = body; // customerId es opcional, puede venir de una sesión de usuario

    // --- Validación de entrada ---
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto es inválido o no se proporcionó.' },
        { status: 400 }
      );
    }
    if (!currency || typeof currency !== 'string') {
      return NextResponse.json(
        { error: 'La moneda es inválida o no se proporcionó.' },
        { status: 400 }
      );
    }
    if (!planId || typeof planId !== 'string') {
      return NextResponse.json(
        { error: 'El ID del plan es inválido o no se proporcionó.' },
        { status: 400 }
      );
    }

    // Asegúrate que amount esté en la unidad correcta (ej. centavos)
    const amountInCents = Math.round(amount);

    // Obtener la URL base para las redirecciones (success y cancel)
    // 'origin' es una cabecera estándar que proporciona el origen de la petición.
    const origin = req.headers.get('origin');
    if (!origin) {
      return NextResponse.json(
        { error: 'No se pudo determinar el origen de la petición para las URLs de redirección.' },
        { status: 400 }
      );
    }

    // --- Creación de la Checkout Session en Stripe ---
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Suscripción ${planId}`, // Nombre descriptivo del producto, podrías buscarlo en DB
              // Aquí podrías añadir una descripción o imágenes si las tuvieras
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Cambia a 'subscription' si es un plan recurrente y tienes Price IDs configurados en Stripe
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?canceled=true`,
      customer: customerId, // Opcional: ID del cliente de Stripe si ya existe y lo pasamos desde el front-end
      metadata: { // Puedes adjuntar información útil
        planId: planId,
        // userId: 'id_del_usuario_autenticado', // Si lo obtienes de la sesión de Next.js
      },
    });

    // Devuelve el ID de la sesión de Checkout al front-end
    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Error en API /create-payment-intent:', error);

    return NextResponse.json(
      { error: `Error al crear la sesión de Checkout: ${error.message || 'Error desconocido'}` },
      { status: error.statusCode || 500 }
    );
  }
}
