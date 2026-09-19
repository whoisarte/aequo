'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PrivacidadPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '48px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}>
          Política de Privacidad
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
        }}>
          Última actualización: 19 de septiembre de 2026
        </p>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-primary)',
          marginBottom: '24px',
          lineHeight: '1.7',
        }}>
          En Aequo (&ldquo;nosotros&rdquo;, &ldquo;nos&rdquo; o &ldquo;nuestro&rdquo;), nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestra aplicación web y servicios relacionados (colectivamente, el &ldquo;Servicio&rdquo;).
        </p>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('responsable')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              1. Responsable del Tratamiento de Datos
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'responsable' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'responsable' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Responsable:</strong> Aequo
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>Correo electrónico:</strong> privacy@aequo.app
              </p>
              <p>
                El responsable del tratamiento de sus datos personales es la persona física o moral que, individalmente o en conjunto con otros, determina los fines y medios del tratamiento de los datos personales.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('recopilacion')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              2. Información que Recopilamos
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'recopilacion' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'recopilacion' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>Recopilamos los siguientes tipos de información:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Datos de registro:</strong> Nombre, correo electrónico, contraseña (de forma cifrada), número de cédula profesional y nombre de despacho.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Datos de calculation:</strong> Información sobre empleados y cálculos laborales que usted ingresa para generar finiquitos y liquidaciones.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Datos de suscripción:</strong> Información relacionada con su plan de suscripción y pagos a través de Stripe.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Datos de uso:</strong> Información sobre cómo accede y utiliza el Servicio, incluyendo cookies y datos de Analytics.
                </li>
                <li>
                  <strong>Comunicación:</strong> Contenido de sus comunicaciones con nosotros, incluyendo el chatbot y soporte.
                </li>
              </ul>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('uso')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              3. Cómo Usamos su Información
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'uso' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'uso' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>Utilizamos su información para:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Proporcionar, mantener y mejorar el Servicio</li>
                <li style={{ marginBottom: '8px' }}>Procesar suscripciones y pagos a través de Stripe</li>
                <li style={{ marginBottom: '8px' }}>Generar cálculos de finiquito y liquidación</li>
                <li style={{ marginBottom: '8px' }}>Comunicarnos con usted sobre su cuenta y el Servicio</li>
                <li style={{ marginBottom: '8px' }}>Cumplir obligaciones legales</li>
                <li>Mejorar la experiencia del usuario y el Servicio</li>
              </ul>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('comparticion')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              4. Compartición de Información
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'comparticion' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'comparticion' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>No vendemos su información personal. Compartimos información únicamente en los siguientes casos:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Proveedores de servicios:</strong> Compartimos datos con Supabase (base de datos), Stripe (pagos) y Google Gemini (chatbot) para la operación del Servicio.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Requisitos legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos.
                </li>
                <li>
                  <strong>Con su consentimiento:</strong> Cuando usted autorice expresamente la compartición.
                </li>
              </ul>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('cookies')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              5. Cookies y Tecnologías de Seguimiento
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'cookies' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'cookies' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>Utilizamos cookies y tecnologías similares para:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Mantener su sesión iniciada</li>
                <li style={{ marginBottom: '8px' }}>Recordar sus preferencias</li>
                <li style={{ marginBottom: '8px' }}>Analizar el uso del Servicio</li>
                <li>Ofrecer funcionalidades del chatbot</li>
              </ul>
              <p>
                Para más información sobre las cookies que utilizamos y sus opciones, consulte nuestra <Link href="/terminos" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Política de Cookies</Link>.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('derechos')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              6. Sus Derechos (LFPDPPP)
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'derechos' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'derechos' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), usted tiene derecho a:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Acceso:</strong> Conocer qué datos personales tenemos de usted</li>
                <li style={{ marginBottom: '8px' }}><strong>Rectificación:</strong> Solicitar la corrección de sus datos si están incorrectos</li>
                <li style={{ marginBottom: '8px' }}><strong>Cancelación:</strong> Solicitar la eliminación de sus datos</li>
                <li style={{ marginBottom: '8px' }}><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para fines específicos</li>
                <li><strong>Revocación:</strong> Revocar su consentimiento en cualquier momento</li>
              </ul>
              <p>Para ejercer cualquiera de estos derechos, comuníquese con nosotros en: <strong>privacy@aequo.app</strong></p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('seguridad')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              7. Medidas de Seguridad
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'seguridad' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'seguridad' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye cifrado de datos en tránsito y en reposo, firewalls, controles de acceso y auditorías regulares.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('terceros')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              8. Servicios de Terceros
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'terceros' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'terceros' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>El Servicio utiliza proveedores terceros:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Supabase:</strong> Base de datos y autenticación. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Política de Privacidad</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Stripe:</strong> Procesamiento de pagos. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Política de Privacidad</a>
                </li>
                <li>
                  <strong>Google Gemini:</strong> Chatbot con IA. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Política de Privacidad</a>
                </li>
              </ul>
            </div>
          )}
        </section>

        <section>
          <button
            onClick={() => toggleSection('cambios')}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '16px 0',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}>
              9. Cambios a Esta Política
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'cambios' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'cambios' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos cualquier cambio importante a través del Servicio o por correo electrónico. Los cambios entrarán en vigor inmediatamente después de su publicación.
              </p>
            </div>
          )}
        </section>

        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            ¿Preguntas sobre esta política? Contáctenos en: <a href="mailto:privacy@aequo.app" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>privacy@aequo.app</a>
          </p>
        </div>
      </div>
    </div>
  )
}
