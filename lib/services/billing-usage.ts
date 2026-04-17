import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Checks if a user has an active subscription.
 * Returns true if active, false otherwise.
 */
export async function checkUserSubscription(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return false;

  // Check if subscription has expired
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return false;
  }

  return true;
}

/**
 * Fetches the 'Single Generation' product details.
 * Assumes a product with name 'Generación individual' exists in the database.
 */
export async function getSingleGenerationProduct() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, stripe_price_id, price_cents')
    .eq('name', 'Generación individual')
    .single();

  if (error) return null;
  return data;
}
