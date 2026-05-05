'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This client can only be used in Server Actions or Route Handlers
// as it requires a `cookieStore` which is only available in a Server Context.
const createSupabaseServerActionClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
}

export async function updateExpedienteConciliacion(
  expedienteId: string,
  conciliacionDate?: string,
  conciliacionTitle?: string,
  conciliacionDescription?: string
) {
  const supabase = await createSupabaseServerActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('expedientes')
    .update({
      conciliacion_date: conciliacionDate || null,
      conciliacion_title: conciliacionTitle || null,
      conciliacion_description: conciliacionDescription || null,
    })
    .eq('id', expedienteId)
    .eq('user_id', user.id) // Ensure only owner can update

  if (error) {
    console.error('Error updating expediente conciliacion:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}