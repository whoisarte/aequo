'use client'

import { useRef, useEffect, useState } from 'react'
import { useCalculadora } from '@/hooks/useCalculadora'
import { useBrandingStore } from '@/store/brandingStore'
import { useExpedientes } from '@/hooks/useExpedientes'
import { descargarPDF } from '@/lib/pdf/generator'
import FormularioEmpleado from '@/components/calculadora/FormularioEmpleado'
import TablaComparativa from '@/components/calculadora/TablaComparativa'
import Button from '@/components/ui/Button'
import Heading from '@/components/ui/Heading'
import PaywallModal from '@/components/ui/PaywallModal'
import { compartirWhatsApp, compartirCorreo } from '@/lib/share'
import { getSubscriptionStatus, getSingleGenerationDetails, checkAccess } from '@/lib/services/billing-actions'

export default function CalculadoraPage() {
  const { branding } = useBrandingStore()
  const resultadosRef = useRef<HTMLDivElement>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [singleProduct, setSingleProduct] = useState<{ id: string; price_cents: number } | null>(null)
  const [access, setAccess] = useState<{ 
    canGenerate: boolean; 
    reason?: string | null; 
    used?: number; 
    limit?: number 
  }>({ canGenerate: false })

  const {
    datos, resultado, errores,
    actualizarDato, generarAniosDisponibles,
    togglePeriodo, actualizarPeriodo,
    calcular, resetear,
  } = useCalculadora(branding.porcentajeConciliacion)
  const { guardar } = useExpedientes()

  // Verificar estado al cargar
  useEffect(() => {
    async function checkStatus() {
      // Check cache first
      const cachedAccess = useBrandingStore.getState().getAccessState()
      if (cachedAccess) {
        setAccess(cachedAccess)
        if (!cachedAccess.canGenerate) {
          const product = await getSingleGenerationDetails()
          setSingleProduct(product)
        }
        return
      }

      // Cache miss; fetch from server
      const accessStatus = await checkAccess()
      setAccess(accessStatus)
      useBrandingStore.getState().setAccessState(accessStatus)

      if (!accessStatus.canGenerate) {
        const product = await getSingleGenerationDetails()
        setSingleProduct(product)
      }
    }
    checkStatus()
  }, [])

  // Efecto para guardar en localStorage
  useEffect(() => {
    if (resultado) {
      localStorage.setItem('aequo_calculo_temporal', JSON.stringify({ datos, resultado }));
    }
  }, [resultado, datos]);

  // Efecto para hacer scroll automático cuando aparece el resultado
  useEffect(() => {
    if (resultado && resultadosRef.current) {
      setTimeout(() => {
        resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [resultado])

  async function validateAccess() {
    const currentAccess = await checkAccess()
    setAccess(currentAccess)
    
    if (currentAccess.canGenerate) return true
    
    setShowPaywall(true)
    return false
  }

  async function refreshAccess() {
    const newAccess = await checkAccess()
    setAccess(newAccess)
    useBrandingStore.getState().setAccessState(newAccess)
  }

  const billedResultRef = useRef<string | null>(null)

  async function registerGenerationIfNew() {
    if (!resultado) return false
    
    // Create a unique key for the current result to check if it's already billed
    // Using a stringified version of the result values for exact comparison
    const currentResultKey = JSON.stringify({
      total: resultado.finiquito.total + resultado.liquidacion.total,
      empleado: datos.nombreEmpleado,
      salida: datos.fechaSalida
    })

    if (billedResultRef.current === currentResultKey) {
      return true // Already billed
    }

    // Bill the user
    await guardar(datos, resultado)
    await refreshAccess()
    billedResultRef.current = currentResultKey
    return true
  }

  async function handleDescargar() {
    if (!resultado) return
    if (!(await validateAccess())) return
    
    // Register the generation if it's the first time for this result
    await registerGenerationIfNew()
    
    await descargarPDF({ resultado, datos, branding }, `aequo-${datos.nombreEmpleado || 'calculo'}`)
  }

  async function handleGuardar() {
    if (!resultado) return
    if (!(await validateAccess())) return
    
    // Register the generation if it's the first time for this result
    await registerGenerationIfNew()
  }

  async function handlePaymentClick() {
    if (!singleProduct) return;

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: singleProduct.id,
          mode: 'payment'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Error al procesar el pago';
      // You might want to use toast here if available
    }
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

  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  async function handleCalcular() {
    calcular()
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
        onCalcular={handleCalcular}
        onResetear={resetear}
      />

      {resultado && (
        <div 
          ref={resultadosRef}
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', scrollMarginTop: '20px' }}
        >
          {access.canGenerate ? (
            <>
              <div style={{ padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tu liquidación estimada es de:</p>
                <Heading level={2}>{fmt(resultado.finiquito.total + resultado.liquidacion.total)}</Heading>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Detalle parcial</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button onClick={handleDescargar}>Descargar PDF</Button>
                  <Button variant="secondary" onClick={handleGuardar}>Guardar expediente</Button>
                  <Button variant="secondary" onClick={handleWhatsApp}>WhatsApp</Button>
                  <Button variant="secondary" onClick={handleCorreo}>Correo</Button>
                </div>
              </div>
              
              <TablaComparativa resultado={resultado} summaryOnly={true} />
            </>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center mt-6">
              <p className="text-gray-600 mb-4">
                Tu liquidación estimada es de {fmt(resultado.finiquito.total + resultado.liquidacion.total)}. El desglose detallado está oculto. Realiza un pago único o suscríbete para verlo.
              </p>
              <Button onClick={handlePaymentClick}>Desbloquear resumen detallado ($50 MXN)</Button>
            </div>
          )}
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
