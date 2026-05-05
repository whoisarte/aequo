'use client'

import { useExpedientes } from '@/hooks/useExpedientes'
import { useBrandingStore } from '@/store/brandingStore'
import { descargarPDF } from '@/lib/pdf/generator'
import TarjetaExpedientes from '@/components/expedientes/TarjetaExpedientes'
import type { Expediente } from '@/hooks/useExpedientes'
import type { TipoDocumento } from '@/lib/calculos/types'
import { updateExpedienteConciliacion } from '@/lib/services/expedientes-actions.server' // Import the Server Action
import { useToast } from '@/lib/toast/index' // Import useToast

function normalizarTipoDocumento(tipo: string): TipoDocumento {
  if (tipo === 'renuncia' || tipo === 'ambos') return tipo
  return 'despido'
}

export default function ExpedientesPage() {
  const { expedientes, eliminar, cargando, error, recargar } = useExpedientes()
  const { branding } = useBrandingStore()
  const toast = useToast() // Initialize useToast

  async function handleDescargar(expediente: Expediente) {
    if (!expediente.resultado) return

    await descargarPDF({
      resultado: expediente.resultado,
      datos: expediente.datosCalculo,
      branding,
    }, `aequo-${expediente.nombreEmpleado}`)
  }

  const handleUpdateConciliacion = async (expedienteId: string, date?: string, title?: string, description?: string) => {
    const result = await updateExpedienteConciliacion(expedienteId, date, title, description)

    if (result.success) {
      toast.success('Fecha de audiencia actualizada correctamente.')
      await recargar() // Re-fetch expedientes to update UI
    } else {
      toast.error(`Error al actualizar la fecha de audiencia: ${result.error}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Expedientes</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {cargando ? 'Cargando...' : `${expedientes.length} ${expedientes.length === 1 ? 'expediente guardado' : 'expedientes guardados'}`}
        </p>
      </div>

      {cargando ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Cargando expedientes...</p>
        </div>
      ) : error ? (
        <div style={{ border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '24px', background: '#fef2f2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#b91c1c' }}>{error}</p>
          <div>
            <button
              type="button"
              onClick={() => void recargar()}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid #fecaca',
                background: '#fff',
                color: '#991b1b',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : expedientes.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No hay expedientes guardados aún.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {expedientes.map(e => (
            <TarjetaExpedientes
              key={e.id}
              expediente={e}
              onEliminar={eliminar}
              onDescargar={handleDescargar}
              onUpdateConciliacion={handleUpdateConciliacion} // Pass the new handler
            />
          ))}
        </div>
      )}
    </div>
  )
}
