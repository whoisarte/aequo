import { supabaseAdmin } from '@/lib/supabase/admin';
import { PlanType } from '@/lib/constants/billing';

export type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  features: string[];
  doc_limit: number;
  currency: string;
  plan_type: PlanType;
};

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, description, price_cents, features, doc_limit, currency, plan_type')
    .eq('is_active', true)
    .eq('currency', 'mxn')
    .order('price_cents', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  const quantityKeywords = ['documentos', 'generaciones', 'docs', 'generations'];

  const filteredData = data
    .map(plan => ({
      ...plan,
      features: plan.features?.filter((feature: string) =>
        quantityKeywords.some(keyword => feature.toLowerCase().includes(keyword))
      ) || [],
    }));

  return filteredData as PricingPlan[];
}

export async function getUserSubscription(userId: string) {
  const { data: allSubs, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, plan, status, current_period_end, created_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false });

  if (fetchError || !allSubs || allSubs.length === 0) return null;

  return allSubs[0];
}
