import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { STRIPE_API_VERSION } from '@/lib/constants/billing'

const getStripe = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StripeModule = (await import('stripe')) as any
  return new StripeModule.default(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock', {
    apiVersion: STRIPE_API_VERSION,
  })
}

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_mock'

async function tryMarkEventProcessed(
  eventId: string,
  eventType: string,
  body: string
): Promise<{ inserted: boolean }> {
  try {
    const { error } = await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_id: eventId,
        event_type: eventType,
        body: JSON.parse(body),
      })

    if (error) {
      if (error.code === '23505') {
        return { inserted: false }
      }
      console.error('Error recording webhook event:', error)
      throw error
    }

    return { inserted: true }
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
      return { inserted: false }
    }
    console.error('Unexpected error in tryMarkEventProcessed:', err)
    throw err
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

  const { inserted } = await tryMarkEventProcessed(event.id, event.type, body)
  if (!inserted) {
    console.log(`Webhook event ${event.id} already processed; skipping`)
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
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
          const stripe = await getStripe()
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
          const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()
          const periodStart = new Date(stripeSub.current_period_start * 1000).toISOString()

          console.log(`Searching for existing subscription for user: ${userId}`)
          const { data: existingSubscription, error: fetchError } = await supabaseAdmin
            .from('subscriptions')
            .select('id, status, stripe_sub_id')
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
            if (existingSubscription.stripe_sub_id && existingSubscription.stripe_sub_id !== session.subscription) {
              try {
                await stripe.subscriptions.cancel(existingSubscription.stripe_sub_id as string)
                console.log(`Canceled old Stripe subscription ${existingSubscription.stripe_sub_id}`)
              } catch (cancelErr) {
                console.error('Error canceling old Stripe subscription:', cancelErr)
              }
            }

            console.log(`Updating existing subscription ${existingSubscription.id} to plan ${planId}`)
            result = await supabaseAdmin
              .from('subscriptions')
              .update({
                plan: planId,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_sub_id: session.subscription as string,
                current_period_start: periodStart,
                current_period_end: periodEnd,
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
                current_period_start: periodStart,
                current_period_end: periodEnd,
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

          const { error: purchaseError } = await supabaseAdmin
            .from('purchases')
            .insert({
              user_id: userId,
              product_id: planId,
              stripe_session_id: session.id as string,
              stripe_payment_intent: session.payment_intent as string,
              amount_cents: session.amount_total as number,
              currency: session.currency as string,
            })

          if (purchaseError) {
            console.error('Error recording one-time purchase:', purchaseError)
            return NextResponse.json({ error: 'Purchase record failed' }, { status: 500 })
          }

          console.log(`One-time purchase recorded for user ${userId}`)
        }
      } else {
        console.error('Missing userId or planId in metadata')
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
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_sub_id', stripeSubId)

      if (error) {
        console.error('Error updating subscription status in Supabase:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      console.log(`Subscription ${stripeSubId} updated to status ${status}.`)

    } else if (event.type === 'charge.refunded') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const charge = event.data.object as any
      const stripeCustomerId = charge.customer as string

      console.log(`Webhook charge.refunded received for customer ${stripeCustomerId}`)

      const stripe = await getStripe()

      // Resolve the refunded charge back to its checkout session to check the mode.
      // Only cancel the subscription if this charge belonged to a subscription checkout,
      // not a one-time $50 generation purchase.
      if (charge.payment_intent) {
        try {
          const session = await stripe.checkout.sessions.list({
            customer: stripeCustomerId,
            limit: 1,
          })
          const latestSession = session.data.find(
            (s: any) => s.payment_intent === charge.payment_intent || s.id === charge.id
          )
          if (latestSession?.metadata?.mode === 'payment') {
            console.log(
              `Refund on one-time payment (mode=payment) for customer ${stripeCustomerId} — skipping subscription cancellation.`
            )
            return NextResponse.json({ received: true })
          }
        } catch (listErr) {
          console.warn('Could not list checkout sessions to determine mode, proceeding with cancellation:', listErr)
        }
      }

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_customer_id', stripeCustomerId)

      if (error) {
        console.error('Error revoking subscription on refund in Supabase:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      console.log(`Subscription for customer ${stripeCustomerId} canceled due to refund.`)

    } else if (event.type === 'invoice.payment_failed') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any
      const stripeCustomerId = invoice.customer as string

      console.log(`Webhook invoice.payment_failed received for customer ${stripeCustomerId}`)

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', stripeCustomerId)

      if (error) {
        console.error('Error marking subscription as past_due in Supabase:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      console.log(`Subscription for customer ${stripeCustomerId} marked as past_due.`)

    } else {
      console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error processing webhook event:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
