'use client'

import { useRef, useEffect } from 'react'
import { useCalculadora } from '@/hooks/useCalculadora'
import { useBrandingStore } from '@/store/brandingStore'
import { useExpedientes } from '@/hooks/useExpedientes'
import { descargarPDF } from '@/lib/pdf/generator'
import FormularioEmpleado from '@/components/calculadora/FormularioEmpleado'
import TablaComparativa from '@/components/calculadora/TablaComparativa'
import Button from '@/components/ui/Button'
import { compartirWhatsApp, compartirCorreo } from '@/lib/share'

export default function CalculadoraPage() {
  const { branding } = useBrandingStore()
  const resultadosRef = useRef<HTMLDivElement>(null)
  const {
    datos, resultado, errores,
    actualizarDato, generarAniosDisponibles,
    togglePeriodo, actualizarPeriodo,
    calcular, resetear,
  } = useCalculadora(branding.porcentajeConciliacion)
  const { guardar } = useExpedientes()

  // Efecto para hacer scroll automático cuando aparece el resultado
  useEffect(() => {
    if (resultado && resultadosRef.current) {
      setTimeout(() => {
        resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [resultado])

  function handleDescargar() {
    if (!resultado) return
    descargarPDF({ resultado, datos, branding }, `aequo-${datos.nombreEmpleado || 'calculo'}`)
  }

  function handleGuardar() {
    if (!resultado) return
    guardar(datos, resultado)
  }

  function handleWhatsApp() {
    if (!resultado) return
    compartirWhatsApp(
      datos.nombreEmpleado,
      resultado.finiquito.total,
      resultado.liquidacion.total,
      datos.tipoDocumento
    )
  }

  function handleCorreo() {
    if (!resultado) return
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
    </div>
  )
}
