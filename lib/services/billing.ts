import Stripe from 'stripe';
import { CreateCheckoutSessionSchema } from './billing.schema';
import { supabaseAdmin } from '../supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

/**
 * Service to handle billing interactions with Stripe.
 * Encapsulates all direct Stripe SDK calls.
 */
export const BillingService = {
/**
   * @param mode 'subscription' for recurring plans, 'payment' for one-time purchases
   */
  async createCheckoutSession(
    { planId, mode = 'subscription' }: { planId: string; mode?: 'subscription' | 'payment' },
    userId: string,
    userEmail: string,
    origin: string
  ) {
    // 1. Validate input
    CreateCheckoutSessionSchema.parse({ planId });

    // 2. Fetch product details from DB
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('stripe_price_id, name')
      .eq('id', planId)
      .single();

    if (error || !product?.stripe_price_id) {
      throw new Error('Producto no encontrado o configuración de precio inválida.');
    }
    
    // 3. Create session
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        planId,
        mode, // Add mode to metadata for webhook processing
      },
    });
  },
};
