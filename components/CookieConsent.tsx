'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'aequo_cookie_consent'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const hasCheckedStorage = useRef(false)

  useEffect(() => {
    if (hasCheckedStorage.current) return
    hasCheckedStorage.current = true

    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    setShowBanner(!stored)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setShowBanner(false)
  }

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only')
    setShowBanner(false)
  }

  if (!showBanner) return null

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
                    Más información
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
                  onClick={handleReject}
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
                  onClick={handleEssentialOnly}
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
                  onClick={handleAccept}
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
                Política de Cookies
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
                ×
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
                  Requeridas para el funcionamiento del sitio. Incluyen sesión de usuario, seguridad y preferencias.
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
                  📊 Cookies de Análisis
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Nos ayudan a entender cómo los usuarios utilizan el sitio para mejorar la experiencia.
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
                  Utilizadas para mantener la conversación con el asistente de IA.
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
                Al aceptar, consientes el uso de todas las cookies. Puedes modificar tu elección en cualquier momento.
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
                  onClick={() => setShowBanner(false)}
                >
                  Ver Política de Privacidad
                </Link>
                <button
                  onClick={handleAccept}
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
