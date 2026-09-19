import { container } from '@/lib/di'
import type { SupabaseClient } from '@supabase/supabase-js'

export const supabaseAdmin: SupabaseClient = container.supabase.admin() as SupabaseClient
