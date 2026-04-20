import { supabaseAdmin } from '@/lib/supabase/admin';

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
    .single();

  if (error) return null;
  return data;
}

export async function getUserDocumentCount(userId: string): Promise<number> {
  // 1. Get user's active subscription start date
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('created_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const startDate = subscription?.created_at || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

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
  // 1. Obtener todas las suscripciones y limpiar duplicados
  const { data: allSubs, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id, plan, status, created_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false });

  if (error || !allSubs || allSubs.length === 0) return { canGenerate: false, reason: 'no_subscription' };
  
  // Cleanup duplicates
  if (allSubs.length > 1) {
    const idsToDelete = allSubs.slice(1).map(s => s.id);
    await supabaseAdmin.from('subscriptions').delete().in('id', idsToDelete);
  }
  
  const subscription = allSubs[0];

  // 2. Obtener el límite del plan contratado
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('doc_limit')
    .eq('id', subscription.plan)
    .single();

  const limit = product?.doc_limit || 0;
  
  // 3. Obtener documentos usados en el mes actual
  const used = await getUserDocumentCount(userId);

  return { 
    canGenerate: used < limit, 
    used, 
    limit,
    reason: used >= limit ? 'limit_exceeded' : null
  };
}
