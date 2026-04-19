'use client'

export default function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px 20px',
      textAlign: 'center',
      gap: '24px'
    }}>
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius)',
        padding: '24px',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#b91c1c',
          margin: '0 0 12px 0'
        }}>
          Algo salió mal
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: '0 0 16px 0'
        }}>
          Se produjo un error inesperado. Intenta nuevamente o contacta a soporte.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details style={{
            textAlign: 'left',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#ffffff',
            borderRadius: 'calc(var(--radius) - 2px)',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#666'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
              Detalles del error (desarrollo)
            </summary>
            <pre style={{
              margin: '8px 0 0 0',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={reset}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'calc(var(--radius) - 2px)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'opacity 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  )
}
