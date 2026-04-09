'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Calculadora', href: '/calculadora' },
  { label: 'Expedientes', href: '/expedientes' },
  { label: 'Estilo', href: '/estilo' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      
      // Lanzar el cierre de sesión sin bloquear por si el servidor tarda
      supabase.auth.signOut().catch(() => {})

      // Limpieza manual total de sesión en navegador
      localStorage.clear()
      sessionStorage.clear()
      
      const cookies = document.cookie.split(";")
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      }

      // Forzar redirección y refresco de página completo
      window.location.href = '/login'
    } catch (error) {
      window.location.href = '/login'
    }
  }

  return (
    <>
      {/* Header móvil */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 1000,
        justifyContent: 'space-between',
      }} className="mobile-only">
        <span style={{ fontWeight: '600', fontSize: '16px' }}>Aequo</span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(2px)',
            zIndex: 998,
          }}
          className="mobile-only"
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          borderRight: '1px solid var(--border)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--bg-primary)',
          zIndex: 999,
        }}
        className={`sidebar-responsive ${isOpen ? 'open' : ''}`}
      >
        <div style={{
          padding: '0 8px 24px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Aequo
          </span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const activo = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
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

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              color: '#ef4444',
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
