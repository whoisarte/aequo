import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const getStripe = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StripeModule = (await import('stripe')) as any
  return new StripeModule.default(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock', {
    apiVersion: '2026-08-26.dahlia',
  })
}

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_mock'

async function isEventNew(eventId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle()

    if (error) {
      console.error('Error checking webhook idempotency:', error)
      return true
    }

    return !data
  } catch (err) {
    console.error('Unexpected error in isEventNew:', err)
    return true
  }
}

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
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = getWebhookSecret()

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any

  try {
    const stripe = await getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const isNew = await isEventNew(event.id)
  if (!isNew) {
    console.log(`Webhook event ${event.id} already processed; skipping`)
    return NextResponse.json({ received: true, duplicate: true })
  }

  if (event.type === 'checkout.session.completed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any

    console.log('Webhook checkout.session.completed received')
    console.log('Session Metadata:', session.metadata)

    const userId = session.metadata?.userId
    const planId = session.metadata?.planId
    const mode = session.metadata?.mode || 'subscription'

    if (userId && planId) {
      if (mode === 'subscription') {
        console.log(`Searching for existing subscription for user: ${userId}`)
        const { data: existingSubscription, error: fetchError } = await supabaseAdmin
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', userId)
          .in('status', ['active', 'trialing'])
          .maybeSingle()

        console.log('Existing subscription search result:', existingSubscription)

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing subscription:', fetchError)
          return NextResponse.json(
            { error: 'Failed to check existing subscription' },
            { status: 500 }
          )
        }

        let result

        if (existingSubscription) {
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
          return NextResponse.json(
            { error: 'Database update failed' },
            { status: 500 }
          )
        }
        console.log('Subscription saved successfully for user:', userId)
      } else if (mode === 'payment') {
        console.log(`One-time payment successful for user ${userId}, plan ${planId}`)
      }
    } else {
      console.error('Missing userId or planId in metadata')
      await markEventProcessed(event.id, event.type, body)
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      )
    }
  } else if (event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any
    const stripeSubId = subscription.id
    const status = subscription.status

    console.log(`Webhook customer.subscription.updated received for ${stripeSubId} with status ${status}`)

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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

  await markEventProcessed(event.id, event.type, body)

  return NextResponse.json({ received: true })
}
