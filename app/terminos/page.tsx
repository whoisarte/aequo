'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TerminosPage() {
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
          Términos y Condiciones de Servicio
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
        }}>
          Última actualización: 19 de septiembre de 2026
        </p>

        <div style={{
          background: 'var(--color-error-light)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: '32px',
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-error-text)',
            fontWeight: '500',
            marginBottom: '8px',
          }}>
            ⚠️ Aviso Importante
          </p>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-error-text)',
            lineHeight: '1.6',
          }}>
            Aequo es una herramienta de cálculo de finiquitos y liquidaciones laborales. Los resultados generados son referenciales y no constituyen asesoría legal. Consulte siempre a un abogado laboralista para casos específicos.
          </p>
        </div>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('aceptacion')}
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
              1. Aceptación de los Términos
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'aceptacion' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'aceptacion' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p>
                Al acceder y utilizar Aequo (&ldquo;el Servicio&rdquo;), usted acepta cumplir con estos Términos y Condiciones (&ldquo;Términos&rdquo;). Si no está de acuerdo con alguno de estos términos, no debe utilizar el Servicio.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('descripcion')}
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
              2. Descripción del Servicio
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'descripcion' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'descripcion' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>
                Aequo es una aplicación web que proporciona:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Calculadora de finiquitos y liquidaciones laborales conforme a la Ley Federal del Trabajo de México</li>
                <li style={{ marginBottom: '8px' }}>Generación de documentos PDF con los cálculos realizados</li>
                <li style={{ marginBottom: '8px' }}>Chatbot de asistencia sobre temas laborales</li>
                <li>Gestión de expedientes de casos laborales</li>
              </ul>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('cuenta')}
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
              3. Cuenta de Usuario y Registro
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'cuenta' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'cuenta' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>Para utilizar el Servicio, usted debe:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Proporcionar información veraz y completa durante el registro</li>
                <li style={{ marginBottom: '8px' }}>Mantener la confidencialidad de su contraseña</li>
                <li style={{ marginBottom: '8px' }}>Ser responsable de todas las actividades bajo su cuenta</li>
                <li style={{ marginBottom: '8px' }}>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                <li>Tener capacidad legal para celebrar contratos (mayor de edad o autorización legal)</li>
              </ul>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('suscripciones')}
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
              4. Suscripciones y Pagos
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'suscripciones' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'suscripciones' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Planes de suscripción:</strong> El Servicio ofrece diferentes planes de suscripción con características y límites variables.
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Los pagos se procesan a través de Stripe, nuestro procesador de pagos tercero</li>
                <li style={{ marginBottom: '8px' }}>Las suscripciones se renuevan automáticamente al final de cada período</li>
                <li style={{ marginBottom: '8px' }}>Puede cancelar su suscripción en cualquier momento desde su cuenta</li>
                <li style={{ marginBottom: '8px' }}>Los reembolsos están sujetos a la política de Stripe</li>
                <li>Los precios pueden cambiar con previo aviso de 30 días</li>
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
              5. Uso Aceptable
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
              <p style={{ marginBottom: '12px' }}>Usted se compromete a NO:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Utilizar el Servicio para fines ilegales o no autorizados</li>
                <li style={{ marginBottom: '8px' }}>Realizar cálculos falsos o engañosos</li>
                <li style={{ marginBottom: '8px' }}>Compartir su cuenta con terceros</li>
                <li style={{ marginBottom: '8px' }}>Intentar acceder de forma no autorizada a los sistemas</li>
                <li style={{ marginBottom: '8px' }}>Interferir con el funcionamiento del Servicio</li>
                <li>Usar el Servicio para violar derechos de terceros</li>
              </ul>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('aviso-legal')}
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
              6. Aviso Legal y Limitación de Responsabilidad
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'aviso-legal' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'aviso-legal' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <div style={{
                background: 'var(--color-error-light)',
                border: '1px solid var(--color-error-border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>⚠️ Los cálculos generados por Aequo son referenciales únicamente.</strong>
                </p>
                <p style={{ marginBottom: '8px' }}>
                  Aequo NO proporciona asesoría legal. Los resultados de la calculadora se basan en la Ley Federal del Trabajo y pueden no considerar circunstancias específicas de su caso.
                </p>
                <p>
                  <strong>Consulte siempre a un abogado laboralista titulado</strong> para obtener orientación legal específica para su situación particular.
                </p>
              </div>
              <p style={{ marginBottom: '12px' }}>
                Aequo no garantiza que los cálculos sean exactos, completos o aplicables a su situación particular. El usuario es responsable de verificar los cálculos y consultar a un profesional.
              </p>
              <p>
                En ningún caso, Aequo o sus afiliados serán responsables por daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso del Servicio.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('propiedad')}
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
              7. Propiedad Intelectual
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'propiedad' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'propiedad' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>
                El Servicio, incluyendo但不限于 su diseño, código, logos y contenido, está protegido por derechos de propiedad intelectual. Usted conserva la propiedad de los datos que ingresa al Servicio.
              </p>
              <p>
                Le otorgamos una licencia limitada, no exclusiva e intransferible para utilizar el Servicio conforme a estos Términos.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('terminacion')}
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
              8. Terminación
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'terminacion' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'terminacion' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>
                Podemos suspender o terminar su cuenta y acceso al Servicio:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
                <li style={{ marginBottom: '8px' }}>Si incumple estos Términos</li>
                <li style={{ marginBottom: '8px' }}>Si lo requiere la ley</li>
                <li style={{ marginBottom: '8px' }}>Si su conducta amenaza la seguridad del Servicio</li>
                <li>Por razones operativas con previo aviso</li>
              </ul>
              <p>
                Puede eliminar su cuenta en cualquier momento. Sus datos serán eliminados conforme a nuestra Política de Privacidad.
              </p>
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <button
            onClick={() => toggleSection('ley')}
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
              9. Ley Aplicable y Jurisdicción
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'ley' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'ley' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p>
                Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia derivada de estos Términos o del uso del Servicio será sometida a la jurisdicción exclusiva de los tribunales competentes de la Ciudad de México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
              </p>
            </div>
          )}
        </section>

        <section>
          <button
            onClick={() => toggleSection('contacto')}
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
              10. Contacto
            </h2>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '20px',
              transition: 'transform 0.2s',
              transform: expandedSection === 'contacto' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {expandedSection === 'contacto' && (
            <div style={{ padding: '16px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>
              <p style={{ marginBottom: '12px' }}>
                Para cualquier cuestión relacionada con estos Términos, puede contactarnos en:
              </p>
              <ul style={{ paddingLeft: '24px' }}>
                <li><strong>Correo electrónico:</strong> legal@aequo.app</li>
              </ul>
            </div>
          )}
        </section>

        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Para información sobre cómo protegemos sus datos, consulte nuestra <Link href="/privacidad" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Política de Privacidad</Link>.
          </p>
          <Link href="/calculadora" style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'var(--button-primary-text)',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontWeight: '500',
          }}>
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
