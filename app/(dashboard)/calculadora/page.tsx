'use client'

import { useRef, useEffect, useState } from 'react'
import { useCalculadora } from '@/hooks/useCalculadora'
import { useBrandingStore } from '@/store/brandingStore'
import { useExpedientes } from '@/hooks/useExpedientes'
import { descargarPDF } from '@/lib/pdf/generator'
import FormularioEmpleado from '@/components/calculadora/FormularioEmpleado'
import TablaComparativa from '@/components/calculadora/TablaComparativa'
import Button from '@/components/ui/Button'
import PaywallModal from '@/components/ui/PaywallModal'
import { compartirWhatsApp, compartirCorreo } from '@/lib/share'
import { getSubscriptionStatus, getSingleGenerationDetails } from '@/lib/services/billing-actions'

export default function CalculadoraPage() {
  const { branding } = useBrandingStore()
  const resultadosRef = useRef<HTMLDivElement>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [singleProduct, setSingleProduct] = useState<{ id: string; price_cents: number } | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const {
    datos, resultado, errores,
    actualizarDato, generarAniosDisponibles,
    togglePeriodo, actualizarPeriodo,
    calcular, resetear,
  } = useCalculadora(branding.porcentajeConciliacion)
  const { guardar } = useExpedientes()

  // Verificar suscripción al cargar
  useEffect(() => {
    async function checkStatus() {
      const { isActive } = await getSubscriptionStatus()
      setIsSubscribed(isActive)
      
      if (!isActive) {
        const product = await getSingleGenerationDetails()
        setSingleProduct(product)
      }
    }
    checkStatus()
  }, [])

  // Efecto para hacer scroll automático cuando aparece el resultado
  useEffect(() => {
    if (resultado && resultadosRef.current) {
      setTimeout(() => {
        resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [resultado])

  async function validateAccess() {
    if (isSubscribed) return true
    
    // Re-verificar por si acaso
    const { isActive } = await getSubscriptionStatus()
    if (isActive) {
      setIsSubscribed(true)
      return true
    }
    
    setShowPaywall(true)
    return false
  }

  async function handleDescargar() {
    if (!resultado) return
    if (!(await validateAccess())) return
    descargarPDF({ resultado, datos, branding }, `aequo-${datos.nombreEmpleado || 'calculo'}`)
  }

  async function handleGuardar() {
    if (!resultado) return
    if (!(await validateAccess())) return
    guardar(datos, resultado)
  }

  async function handleWhatsApp() {
    if (!resultado) return
    if (!(await validateAccess())) return
    compartirWhatsApp(
      datos.nombreEmpleado,
      resultado.finiquito.total,
      resultado.liquidacion.total,
      datos.tipoDocumento
    )
  }

  async function handleCorreo() {
    if (!resultado) return
    if (!(await validateAccess())) return
    compartirCorreo(
      datos.nombreEmpleado,
      resultado.finiquito.total,
      resultado.liquidacion.total,
      datos.tipoDocumento
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Calculadora</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ingresa los datos del empleado para generar el cálculo comparativo</p>
      </div>

      <FormularioEmpleado
        datos={datos}
        errores={errores}
        aniosDisponibles={generarAniosDisponibles()}
        onCambio={actualizarDato}
        onTogglePeriodo={togglePeriodo}
        onActualizarPeriodo={actualizarPeriodo}
        onCalcular={calcular}
        onResetear={resetear}
      />

      {resultado && (
        <div 
          ref={resultadosRef}
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', scrollMarginTop: '20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Resultado comparativo</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={handleDescargar}>Descargar PDF</Button>
              <Button variant="secondary" onClick={handleGuardar}>Guardar expediente</Button>
              <Button variant="secondary" onClick={handleWhatsApp}>WhatsApp</Button>
              <Button variant="secondary" onClick={handleCorreo}>Correo</Button>
            </div>
          </div>
          <TablaComparativa resultado={resultado} />
        </div>
      )}

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        singleProduct={singleProduct}
      />
    </div>
  )
}
