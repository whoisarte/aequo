'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBrandingStore } from '@/store/brandingStore'
import { obtenerPerfilSupabase } from '@/lib/supabase/perfil'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setBranding } = useBrandingStore()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const perfil = await obtenerPerfilSupabase()
        if (perfil) setBranding(perfil)
      }
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })
  }, [])

  return <>{children}</>
}