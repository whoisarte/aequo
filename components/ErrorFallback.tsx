'use client'

interface ErrorFallbackProps {
  error: Error
  reset: () => void
  title?: string
  description?: string
}

export default function ErrorFallback({
  error,
  reset,
  title = 'Algo salió mal',
  description = 'Se produjo un error inesperado. Intenta nuevamente o contacta a soporte.',
}: ErrorFallbackProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-error-light)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          maxWidth: '500px',
        }}
      >
        <h1
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--color-error-text)',
            margin: '0 0 12px 0',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: '0 0 16px 0',
          }}
        >
          {description}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details
            style={{
              textAlign: 'left',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'calc(var(--radius) - 2px)',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--text-secondary)',
            }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
              Detalles del error (desarrollo)
            </summary>
            <pre
              style={{
                margin: '8px 0 0 0',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={reset}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'var(--color-error)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'calc(var(--radius) - 2px)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
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
