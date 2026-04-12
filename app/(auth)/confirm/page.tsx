'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    let active = true

    async function confirmarSesionDesdeHash() {
      const hash = window.location.hash
      if (!hash) {
        router.push('/login')
        return
      }

      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        router.push('/login')
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

      if (!active) return

      if (error) {
        router.push('/login')
        return
      }

      router.refresh()
      router.push('/calculadora')
    }

    void confirmarSesionDesdeHash()

    return () => {
      active = false
    }
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-surface)',
    }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verificando sesión...</p>
    </div>
  )
}
