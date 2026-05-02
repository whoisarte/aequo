'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Calculadora', href: '/calculadora' },
  { label: 'Expedientes', href: '/expedientes' },
  { label: 'Perfil', href: '/estilo' },
  { label: 'Calendario', href: '/calendario' },
  { label: 'Membresía', href: '/billing' },
]

interface NavigationProps {
  onNavigate?: () => void
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {navItems.map((item) => {
        const activo = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              color: activo ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: activo ? 'var(--bg-surface)' : 'transparent',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: activo ? '600' : '500',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
