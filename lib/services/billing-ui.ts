import { supabaseAdmin } from '@/lib/supabase/admin';

export type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  features: string[];
  doc_limit: number;
  currency: string; // Added currency property
};

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, description, price_cents, features, doc_limit, currency') // Ensure currency is selected
    .eq('is_active', true)
    .eq('currency', 'mxn')
    .order('price_cents', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  const quantityKeywords = ['documentos', 'generaciones', 'docs'];

  const filteredData = data
    .map(plan => ({
      ...plan,
      features: plan.features.filter((feature: string) =>
        quantityKeywords.some(keyword => feature.toLowerCase().includes(keyword))
      ),
    }));

  return filteredData as PricingPlan[];
}

export async function getUserSubscription(userId: string) {
  // Aseguramos que solo traiga registros que sean explícitamente suscripciones
  // y que no tengan el modo 'payment' (pago único)
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing']) // Allow active or trialing statuses
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
