import { container } from '@/lib/di'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function createClient(): Promise<SupabaseClient> {
  return container.supabase.server() as Promise<SupabaseClient>
}
