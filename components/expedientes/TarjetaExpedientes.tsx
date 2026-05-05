'use client'

import { useState } from 'react' // Import useState
import type { Expediente } from '@/hooks/useExpedientes'
import Button from '@/components/ui/Button'
import { compartirWhatsApp, compartirCorreo } from '@/lib/share'
import Dialog from '@/components/ui/Dialog' // Import Dialog

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

// Helper to format date to DD-MM-YYYY
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

type Props = {
  expediente: Expediente
  onEliminar: (id: string) => void
  onDescargar: (expediente: Expediente) => void
  onUpdateConciliacion: (id: string, date?: string, title?: string, description?: string) => void // New prop
}

export default function TarjetaExpedientes({ expediente, onEliminar, onDescargar, onUpdateConciliacion }: Props) {
  const fecha = new Date(expediente.creadoEn).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  const [isConciliacionModalOpen, setIsConciliacionModalOpen] = useState(false)

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>
          {expediente.nombreEmpleado}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {expediente.puestoEmpleado} — {expediente.empresa}
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Finiquito: <strong>{fmt(expediente.resultado.finiquito.total)}</strong>
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Liquidación: <strong>{fmt(expediente.resultado.liquidacion.total)}</strong>
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-hint)' }}>{fecha}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={() => onDescargar(expediente)}>PDF</Button>
          <Button variant="secondary" onClick={() => compartirWhatsApp(
            expediente.nombreEmpleado,
            expediente.resultado.finiquito.total,
            expediente.resultado.liquidacion.total,
            expediente.tipoDocumento
          )}>WA</Button>
          <Button variant="secondary" onClick={() => compartirCorreo(
            expediente.nombreEmpleado,
            expediente.resultado.finiquito.total,
            expediente.resultado.liquidacion.total,
            expediente.tipoDocumento
  )}>Email</Button>
          <Button variant="secondary" onClick={() => onEliminar(expediente.id)}>Eliminar</Button>
        </div>
        {/* New button for Conciliacion Date */}
        <Button 
          variant="primary" 
          fullWidth={expediente.conciliacionDate ? false : true} // Make fullWidth if no date, smaller if date is shown
          onClick={() => setIsConciliacionModalOpen(true)}
          style={{ marginTop: '8px' }} // Add some top margin to separate from other buttons
        >
          {expediente.conciliacionDate ? 
            `Audiencia: ${formatDate(expediente.conciliacionDate)}` : 
            'Agregar audiencia de conciliación'}
        </Button>
      </div>

      <Dialog 
        isOpen={isConciliacionModalOpen} 
        onClose={() => setIsConciliacionModalOpen(false)} 
        title={expediente.conciliacionDate ? 'Editar fecha de audiencia' : 'Agregar fecha de audiencia'}
      >
        <ConciliacionForm
          expedienteId={expediente.id}
          initialDate={expediente.conciliacionDate}
          initialTitle={expediente.conciliacionTitle}
          initialDescription={expediente.conciliacionDescription}
          onCancel={() => setIsConciliacionModalOpen(false)}
          onSubmit={(id, date, title, description) => {
            onUpdateConciliacion(id, date, title, description)
            setIsConciliacionModalOpen(false)
          }}
        />
      </Dialog>
    </div>
  )
}