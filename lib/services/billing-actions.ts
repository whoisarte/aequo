'use server'

import { createClient } from '@/lib/supabase/server';
import { checkUserSubscription, getSingleGenerationProduct, canGenerateDocument } from './billing-usage';
import { BillingService } from './billing';

export async function getSubscriptionStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isActive: false, userId: null };

  const isActive = await checkUserSubscription(user.id);
  return { isActive, userId: user.id };
}

export async function checkAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { canGenerate: false };
  
  return await canGenerateDocument(user.id);
}

export async function getSingleGenerationDetails() {
  return await getSingleGenerationProduct();
}

export async function cancelSubscriptionAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Debes iniciar sesión para realizar esta acción.');
  }

  try {
    await BillingService.cancelSubscription(user.id);
    return { success: true };
  } catch (error) {
    console.error('Error in cancelSubscriptionAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error inesperado al cancelar la suscripción.' 
    };
  }
}
