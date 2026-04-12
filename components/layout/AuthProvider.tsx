'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clearCachedUserId, getCachedBranding, getCachedUserId, setCachedUserId } from '@/lib/auth/cache'
import { createClient } from '@/lib/supabase/client'
import { useBrandingStore } from '@/store/brandingStore'
import { obtenerPerfilSupabase } from '@/lib/supabase/perfil'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setBranding, resetear } = useBrandingStore()

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function hidratarPerfil(userId: string) {
      const brandingCacheado = getCachedBranding(userId)
      if (brandingCacheado) {
        setBranding(brandingCacheado)
      }

      const perfil = await obtenerPerfilSupabase()
      if (!active) return

      if (perfil.status === 'ok') {
        setBranding(perfil.perfil)
        return
      }

      if (perfil.status === 'empty') {
        resetear()
      }
    }

    const cachedUserId = getCachedUserId()
    if (cachedUserId) {
      const brandingCacheado = getCachedBranding(cachedUserId)
      if (brandingCacheado) {
        setBranding(brandingCacheado)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user.id) {
          setCachedUserId(session.user.id)
          await hidratarPerfil(session.user.id)
        }
        if (event === 'SIGNED_OUT') {
          clearCachedUserId()
          resetear()
          router.refresh()
          router.push('/login')
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [resetear, router, setBranding])

  return <>{children}</>
}
