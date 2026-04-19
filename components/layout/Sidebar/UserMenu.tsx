'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu() {
  const router = useRouter()
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const [errorLogout, setErrorLogout] = useState('')

  const handleLogout = async () => {
    if (cerrandoSesion) return

    setCerrandoSesion(true)
    setErrorLogout('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        setErrorLogout('No se pudo cerrar la sesión. Intenta nuevamente.')
        return
      }

      router.refresh()
      router.push('/login')
    } catch {
      setErrorLogout('No se pudo cerrar la sesión. Intenta nuevamente.')
    } finally {
      setCerrandoSesion(false)
    }
  }

  return (
    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
      {errorLogout && (
        <p style={{ fontSize: '12px', color: 'var(--color-error-text)', marginBottom: '8px' }}>
          {errorLogout}
        </p>
      )}
      <button
        onClick={handleLogout}
        disabled={cerrandoSesion}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 'var(--radius)',
          color: 'var(--color-error)',
          background: 'transparent',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
          cursor: cerrandoSesion ? 'not-allowed' : 'pointer',
          opacity: cerrandoSesion ? 0.6 : 1,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
