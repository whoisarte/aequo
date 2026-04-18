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
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabaseAdmin
    .from('expedientes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  return error ? 0 : (count || 0);
}

export async function canGenerateDocument(userId: string) {
  // 1. Obtener la suscripción activa
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .eq('status', 'active')
    .not('plan', 'ilike', '%individual%')
    .maybeSingle();

  // Si no tiene suscripción activa, no puede generar documentos mediante suscripción
  if (error || !subscription) return { canGenerate: false, reason: 'no_subscription' };

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
