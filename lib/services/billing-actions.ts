'use server'

import { createClient } from '@/lib/supabase/server';
import { checkUserSubscription, getSingleGenerationProduct } from './billing-usage';

export async function getSubscriptionStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isActive: false, userId: null };

  const isActive = await checkUserSubscription(user.id);
  return { isActive, userId: user.id };
}

export async function getSingleGenerationDetails() {
  return await getSingleGenerationProduct();
}
