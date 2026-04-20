import Stripe from 'stripe';
import { CreateCheckoutSessionSchema } from './billing.schema';
import { supabaseAdmin } from '../supabase/admin';
import { getOrCreateStripeCustomer } from './stripe-customer';

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
    try {
      CreateCheckoutSessionSchema.parse({ planId });
    } catch (e) {
      console.error('Validation error:', e);
      throw e;
    }

    // 2. Fetch product details from DB
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('stripe_price_id, name')
      .eq('id', planId)
      .single();

    if (error) {
      console.error('Supabase DB error:', error);
      throw new Error('Error al consultar producto: ' + error.message);
    }
    
    if (!product?.stripe_price_id) {
      console.error('Product found but no stripe_price_id:', product);
      throw new Error('Producto no encontrado o configuración de precio inválida.');
    }

    // 3. Get or create Stripe customer (idempotent)
    const customerId = await getOrCreateStripeCustomer(userId, userEmail);
    
    // 4. Create checkout session
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
      });
    } catch (e) {
      console.error('Stripe SDK error:', e);
      throw e;
    }
  },
};
