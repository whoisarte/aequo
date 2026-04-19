import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

/**
 * Get or create a Stripe customer for a user.
 * Ensures idempotency by checking Supabase for existing customer_id first.
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
    // 1. Check if customer already exists in our DB
    const { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle()

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 = not found (expected for new users)
      console.error('Error querying user stripe_customer_id:', queryError)
      throw new Error('Failed to check existing customer: ' + queryError.message)
    }

    // 2. If customer exists in DB, return it
    if (user?.stripe_customer_id) {
      console.log(`Using existing Stripe customer: ${user.stripe_customer_id}`)
      return user.stripe_customer_id
    }

    // 3. Create new Stripe customer
    console.log(`Creating new Stripe customer for user ${userId}`)
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    // 4. Store customer_id in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        stripe_customer_id: customer.id,
      }, {
        onConflict: 'id',
      })

    if (updateError) {
      console.error('Error saving stripe_customer_id to Supabase:', updateError)
      // Don't throw - we have the customer ID, just couldn't save it
      // Future calls will create another customer, but checkout will work
    }

    console.log(`Created Stripe customer ${customer.id} for user ${userId}`)
    return customer.id
  } catch (err) {
    console.error('Error in getOrCreateStripeCustomer:', err)
    throw err
  }
}
