import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock', {
  apiVersion: '2026-04-22.dahlia' as any,
})

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  try {
    console.log(`Searching Stripe for existing customer with userId ${userId}`)
    const customers = await stripe.customers.list({
      email,
      limit: 100,
    })

    const existingCustomer = customers.data.find(
      (c) => c.metadata?.userId === userId
    )

    if (existingCustomer) {
      console.log(`Found existing Stripe customer: ${existingCustomer.id}`)
      return existingCustomer.id
    }

    console.log(`Creating new Stripe customer for user ${userId}`)
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    console.log(`Created Stripe customer ${customer.id} for user ${userId}`)
    return customer.id
  } catch (err) {
    console.error('Error in getOrCreateStripeCustomer:', err)
    throw err
  }
}
