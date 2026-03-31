import type { Expediente } from '@/hooks/useExpedientes'
import Button from '@/components/ui/Button'
import { compartirWhatsApp, compartirCorreo } from '@/lib/share'

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

type Props = {
  expediente: Expediente
  onEliminar: (id: string) => void
  onDescargar: (expediente: Expediente) => void
}

export default function TarjetaExpedientes({ expediente, onEliminar, onDescargar }: Props) {
  const fecha = new Date(expediente.creadoEn).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

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
      </div>
    </div>
  )
}