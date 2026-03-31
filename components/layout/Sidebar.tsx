'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Calculadora', href: '/calculadora' },
  { label: 'Expedientes', href: '/expedientes' },
  { label: 'Estilo', href: '/estilo' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      borderRight: '1px solid var(--border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        padding: '0 8px 24px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Aequo
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const activo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius)',
                color: activo ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: activo ? 'var(--bg-surface)' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: activo ? '500' : '400',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: '8px',
          borderRadius: 'var(--radius)',
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
          textAlign: 'left',
          marginTop: 'auto',
        }}
      >
        Cerrar sesión
      </button>
    </aside>
  )
}