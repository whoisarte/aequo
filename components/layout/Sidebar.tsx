'use client'

import { useState } from 'react'
import Navigation from './Sidebar/Navigation'
import UserMenu from './Sidebar/UserMenu'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

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

        <Navigation onNavigate={() => setIsOpen(false)} />
        <UserMenu />
      </aside>
    </>
  )
}
