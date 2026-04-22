import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Check if webhook event has already been processed
 * Returns true if event is new, false if already processed
 */
async function isEventNew(eventId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle()

    if (error) {
      console.error('Error checking webhook idempotency:', error)
      // On error, assume event is new (fail open) to avoid missing real events
      return true
    }

    return !data // True if no record found (event is new)
  } catch (err) {
    console.error('Unexpected error in isEventNew:', err)
    return true // Fail open
  }
}

/**
 * Record that a webhook event has been processed
 */
async function markEventProcessed(
  eventId: string,
  eventType: string,
  body: string
): Promise<void> {
  try {
    await supabaseAdmin.from('webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      body: JSON.parse(body),
    })
  } catch (err) {
    console.error('Error recording webhook event:', err)
    // Continue processing even if recording fails; idempotency check is best-effort
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Check if this event has already been processed (idempotency)
  const isNew = await isEventNew(event.id)
  if (!isNew) {
    console.log(`Webhook event ${event.id} already processed; skipping`)
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    console.log('Webhook checkout.session.completed received')
    console.log('Session Metadata:', session.metadata)

    const userId = session.metadata?.userId
    const planId = session.metadata?.planId
    const mode = session.metadata?.mode || 'subscription'

    if (userId && planId) {
      if (mode === 'subscription') {
        // First, try to find existing subscription for this user
        console.log(`Searching for existing subscription for user: ${userId}`);
        const { data: existingSubscription, error: fetchError } = await supabaseAdmin
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', userId)
          .in('status', ['active', 'trialing'])
          .maybeSingle()

        console.log('Existing subscription search result:', existingSubscription);

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing subscription:', fetchError)
          return NextResponse.json(
            { error: 'Failed to check existing subscription' },
            { status: 500 }
          )
        }

        let result

        if (existingSubscription) {
          // Update existing subscription
          console.log(`Updating existing subscription ${existingSubscription.id} to plan ${planId}`)
          result = await supabaseAdmin
            .from('subscriptions')
            .update({
              plan: planId,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_sub_id: session.subscription as string,
              current_period_end: new Date().toISOString(),
            })
            .eq('id', existingSubscription.id)
        } else {
          // Create new subscription
          console.log(`Creating new subscription for user ${userId}`)
          result = await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan: planId,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_sub_id: session.subscription as string,
              current_period_end: new Date().toISOString(),
            })
        }

        const { error } = result

        if (error) {
          console.error('Error updating/creating subscription in Supabase:', error)
          // Return 500 to trigger Stripe retry
          return NextResponse.json(
            { error: 'Database update failed' },
            { status: 500 }
          )
        }
        console.log('Subscription saved successfully for user:', userId)
      } else if (mode === 'payment') {
        console.log(
          `One-time payment successful for user ${userId}, plan ${planId}`
        )
      }
    } else {
      console.error('Missing userId or planId in metadata')
      // Still record the event to prevent retries
      await markEventProcessed(event.id, event.type, body)
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      )
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeSubId = subscription.id

    console.log(`Webhook customer.subscription.deleted received for ${stripeSubId}`)

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_sub_id', stripeSubId)

    if (error) {
      console.error('Error updating subscription to canceled in Supabase:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
    console.log(`Subscription ${stripeSubId} marked as canceled.`)

  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeSubId = subscription.id
    const status = subscription.status

    console.log(`Webhook customer.subscription.updated received for ${stripeSubId} with status ${status}`)

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: status,
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
      })
      .eq('stripe_sub_id', stripeSubId)

    if (error) {
      console.error('Error updating subscription status in Supabase:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
    console.log(`Subscription ${stripeSubId} updated to status ${status}.`)

  } else {
    console.log(`Unhandled webhook event type: ${event.type}`)
  }

  // Record successful processing
  await markEventProcessed(event.id, event.type, body)

  return NextResponse.json({ received: true })
}
