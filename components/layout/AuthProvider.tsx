'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBrandingStore } from '@/store/brandingStore'
import { obtenerPerfilSupabase } from '@/lib/supabase/perfil'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setBranding } = useBrandingStore()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          const perfil = await obtenerPerfilSupabase()
          if (perfil.status === 'ok') {
            setBranding(perfil.perfil)
          }
        }
        if (event === 'SIGNED_OUT') {
          router.refresh()
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, setBranding])

  return <>{children}</>
}
