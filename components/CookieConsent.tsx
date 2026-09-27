'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCookieConsent } from '@/lib/cookie-consent'

export default function CookieConsent() {
  const { consent, hasConsented, acceptAll, acceptEssentialOnly } = useCookieConsent()
  const [showDetails, setShowDetails] = useState(false)

  if (hasConsented) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {!showDetails ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  🍪 Uso de Cookies
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Utilizamos cookies para mejorar tu experiencia, analizar el uso del servicio y personalizar contenido.
                  <button
                    onClick={() => setShowDetails(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: 0,
                      marginLeft: '4px',
                    }}
                  >
                    M&aacute;s informaci&oacute;n
                  </button>
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={acceptEssentialOnly}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Rechazar
                </button>
                <button
                  onClick={acceptEssentialOnly}
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
                >
                  Solo Esenciales
                </button>
                <button
                  onClick={acceptAll}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    color: 'var(--button-primary-text)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Aceptar Todo
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                Pol&iacute;tica de Cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  marginBottom: '16px',
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  🍪 Cookies Esenciales (Necesarias)
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Requeridas para el funcionamiento del sitio. Incluyen sesi&oacute;n de usuario, seguridad y preferencias.
                  <br />
                  <strong>No requieren consentimiento.</strong>
                </p>
              </div>

              <div
                style={{
                  marginBottom: '16px',
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  📊 Cookies de An&aacute;lisis
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Nos ayudan a entender c&oacute;mo los usuarios utilizan el sitio para mejorar la experiencia.
                  <br />
                  <strong>Requieren consentimiento.</strong>
                </p>
              </div>

              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  💬 Cookies del Chatbot
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Utilizadas para mantener la conversaci&oacute;n con el asistente de IA.
                  <br />
                  <strong>Requieren consentimiento.</strong>
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Al aceptar, consientes el uso de todas las cookies. Puedes modificar tu elecci&oacute;n en cualquier momento.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link
                  href="/privacidad"
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: 'none',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowDetails(false)}
                >
                  Ver Pol&iacute;tica de Privacidad
                </Link>
                <button
                  onClick={acceptAll}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    color: 'var(--button-primary-text)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
