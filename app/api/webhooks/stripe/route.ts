import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('Webhook checkout.session.completed received');
    console.log('Session Metadata:', session.metadata);

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const mode = session.metadata?.mode || 'subscription';

    if (userId && planId) {
      if (mode === 'subscription') {
        // Update subscription in database
        const { error, data } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan: planId,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_sub_id: session.subscription as string,
            current_period_end: new Date().toISOString(), 
          });

        if (error) {
          console.error('Error updating subscription in Supabase:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        console.log('Subscription updated successfully for user:', userId);
      } else if (mode === 'payment') {
        console.log(`One-time payment successful for user ${userId}, plan ${planId}`);
      }
    } else {
      console.error('Missing userId or planId in metadata');
    }
  }

  return NextResponse.json({ received: true });
}
