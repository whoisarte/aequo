import { supabaseAdmin } from '@/lib/supabase/admin';
import { PlanType } from '@/lib/constants/billing';

export async function checkUserSubscription(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return false;

  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return false;
  }

  return true;
}

export async function getSingleGenerationProduct() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, stripe_price_id, price_cents')
    .eq('name', 'Generación individual')
    .eq('plan_type', PlanType.OneTime)
    .single();

  if (error) return null;
  return data;
}

export async function getUserDocumentCount(userId: string): Promise<number> {
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('current_period_start')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let startDate: string;
  if (subscription?.current_period_start) {
    const periodStart = new Date(subscription.current_period_start);
    const monthStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
    startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString();
  } else {
    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  }

  console.log('Counting documents for:', userId, 'since:', startDate);

  const { count, error } = await supabaseAdmin
    .from('expedientes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate);

  if (error) {
    console.error('Error counting documents:', error);
  } else {
    console.log('Count returned:', count);
  }

  return error ? 0 : (count || 0);
}

export async function canGenerateDocument(userId: string) {
  const { data: allSubs, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id, plan, status, created_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false });

  if (error || !allSubs || allSubs.length === 0) {
    return { canGenerate: false, reason: 'no_subscription' };
  }

  const subscription = allSubs[0];

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('doc_limit, plan_type')
    .eq('id', subscription.plan)
    .single();

  if (!product) {
    return { canGenerate: false, reason: 'plan_not_found' };
  }

  const limit = product.doc_limit || 0;
  const used = await getUserDocumentCount(userId);

  return {
    canGenerate: used < limit,
    used,
    limit,
    reason: used >= limit ? 'limit_exceeded' : null
  };
}
