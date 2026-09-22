'use client'

import { ReactNode, useEffect } from 'react'

interface CalendarFormViewProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function CalendarFormView({ title, onClose, children }: CalendarFormViewProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-primary)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'var(--bg-surface)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'transparent'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '640px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
