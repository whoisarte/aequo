import { container } from '@/lib/di'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient {
  return container.supabase.client() as SupabaseClient
}
