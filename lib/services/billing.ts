import Stripe from 'stripe'
import { CreateCheckoutSessionSchema } from './billing.schema'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getOrCreateStripeCustomer } from './stripe-customer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock', {
  apiVersion: '2026-04-22.dahlia' as any,
})

export const BillingService = {
  async createCheckoutSession(
    { planId, mode = 'subscription' }: { planId: string; mode?: 'subscription' | 'payment' },
    userId: string,
    userEmail: string,
    origin: string
  ) {
    try {
      CreateCheckoutSessionSchema.parse({ planId })
    } catch (e) {
      console.error('Validation error:', e)
      throw e
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('stripe_price_id, name')
      .eq('id', planId)
      .single()

    if (error) {
      console.error('Supabase DB error:', error)
      throw new Error('Error al consultar producto: ' + error.message)
    }

    if (!product?.stripe_price_id) {
      console.error('Product found but no stripe_price_id:', product)
      throw new Error('Producto no encontrado o configuración de precio inválida.')
    }

    const customerId = await getOrCreateStripeCustomer(userId, userEmail)

    try {
      return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [
          {
            price: product.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: mode === 'subscription'
          ? `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}&planId=${planId}`
          : `${origin}/calculadora/download?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/billing?canceled=true`,
        metadata: {
          userId,
          planId,
          mode,
        },
      })
    } catch (e) {
      console.error('Stripe SDK error:', e)
      throw e
    }
  },

  async cancelSubscription(userId: string) {
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_sub_id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (error) {
      console.error('Error fetching subscription from DB:', error)
      throw new Error('Error al consultar la suscripción en la base de datos.')
    }

    if (!subscription?.stripe_sub_id) {
      return null
    }

    try {
      return await stripe.subscriptions.update(subscription.stripe_sub_id, {
        cancel_at_period_end: true,
      })
    } catch (e) {
      console.error('Error cancelling subscription in Stripe:', e)
      throw new Error('Error al cancelar la suscripción en Stripe.')
    }
  },
}
