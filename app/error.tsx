'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('Global error caught:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--bg-surface)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#dc2626',
            marginBottom: '12px',
          }}
        >
          Algo salió mal
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}
        >
          Lo sentimos. Encontramos un error inesperado. Nuestro equipo ha sido
          notificado y estamos trabajando en solucionarlo.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div
            style={{
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#666',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            <strong>Error Details:</strong>
            <br />
            {error.message}
            {error.digest && (
              <>
                <br />
                <strong>Digest:</strong> {error.digest}
              </>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = '0.9')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = '1')
            }
          >
            Intentar de nuevo
          </button>

          <button
            onClick={() => {
              router.push('/login')
            }}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.background = '#f5f5f5')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.background = 'transparent')
            }
          >
            Volver a inicio
          </button>
        </div>
      </div>
    </div>
  )
}
