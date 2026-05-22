import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

/**
 * Get or create a Stripe customer for a user.
 * Searches Stripe for existing customer with matching userId metadata,
 * or creates a new one if not found.
 *
 * @param userId Supabase user ID
 * @param email User email address
 * @returns Stripe customer ID
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  try {
    // 1. Search Stripe for existing customer with this userId in metadata
    console.log(`Searching Stripe for existing customer with userId ${userId}`)
    const customers = await stripe.customers.list({
      email,
      limit: 100,
    })

    // Find customer with matching userId in metadata
    const existingCustomer = customers.data.find(
      (c) => c.metadata?.userId === userId
    )

    if (existingCustomer) {
      console.log(`Found existing Stripe customer: ${existingCustomer.id}`)
      return existingCustomer.id
    }

    // 2. Create new Stripe customer if not found
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
