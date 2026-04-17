import { supabaseAdmin } from '@/lib/supabase/admin';

export type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  features: string[];
  doc_limit: number;
};

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, description, price_cents, features, doc_limit')
    .eq('is_active', true)
    .eq('currency', 'mxn')
    .order('price_cents', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  // Filtrar características para solo mostrar temas de cantidad
  const quantityKeywords = ['documentos', 'generaciones', 'docs'];

  const filteredData = data.map(plan => ({
    ...plan,
    features: plan.features.filter((feature: string) =>
      quantityKeywords.some(keyword => feature.toLowerCase().includes(keyword))
    ),
  }));

  return filteredData as PricingPlan[];
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) return null;
  return data;
}
