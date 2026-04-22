'use server'

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { BillingService } from './billing';

export async function deleteUserAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Debes iniciar sesión para realizar esta acción.');
  }

  try {
    // 1. Try to cancel subscription if exists
    try {
      await BillingService.cancelSubscription(user.id);
    } catch (e) {
      // Log and continue, as account deletion is the priority
      console.error('Error cancelling subscription during account deletion:', e);
    }

    // 2. Delete user from Supabase Auth (Admin SDK)
    // This will trigger CASCADE deletion of profiles, subscriptions, and expedientes
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (error) {
      console.error('Supabase Admin delete error:', error);
      throw new Error('Error al eliminar el usuario de la base de datos.');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteUserAccountAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocurrió un error inesperado al eliminar la cuenta.' 
    };
  }
}
