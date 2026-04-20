import type { ResultadoCalculo } from '@/lib/calculos/types'

type Props = {
  resultado: ResultadoCalculo
  summaryOnly?: boolean
}

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export default function TablaComparativa({ resultado, summaryOnly = false }: Props) {
  const { finiquito, liquidacion, diasLaborados, aniosServicio, tipoDocumento } = resultado

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius)', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Días laborados</p>
          <p style={{ fontSize: '20px', fontWeight: '600' }}>{diasLaborados}</p>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius)', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Años de servicio</p>
          <p style={{ fontSize: '20px', fontWeight: '600' }}>{aniosServicio}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(tipoDocumento === 'despido' || tipoDocumento === 'ambos') && (
          <TablaDesglose
            titulo="Liquidación — Despido injustificado"
            subtitulo="Despido injustificado"
            desglose={liquidacion.desglose}
            total={liquidacion.total}
            summaryOnly={summaryOnly}
          />
        )}
        {(tipoDocumento === 'renuncia' || tipoDocumento === 'ambos') && (
          <TablaDesglose
            titulo="Finiquito — Renuncia voluntaria"
            subtitulo="Renuncia voluntaria"
            desglose={finiquito.desglose}
            total={finiquito.total}
            summaryOnly={summaryOnly}
          />
        )}
      </div>
    </div>
  )
}

function TablaDesglose({ titulo, subtitulo, desglose, total, summaryOnly }: {
  titulo: string
  subtitulo: string
  desglose: ResultadoCalculo['finiquito']['desglose']
  total: number
  summaryOnly: boolean
}) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <p style={{ fontWeight: '500', fontSize: '13px' }}>{titulo}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{subtitulo}</p>
      </div>
      
      {!summaryOnly && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Prestación</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center', minWidth: '50px' }}>Días</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right', minWidth: '90px' }}>Total</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right', minWidth: '90px' }}>Conciliación</p>
          </div>
          {desglose.map((paso, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', padding: '10px 16px', borderBottom: '1px solid var(--border)', gap: '8px' }}>
              <p style={{ fontSize: '13px' }}>{paso.concepto}</p>
              <p style={{ fontSize: '13px', textAlign: 'center', minWidth: '50px' }}>{paso.dias}</p>
              <p style={{ fontSize: '13px', fontWeight: '500', textAlign: 'right', minWidth: '90px' }}>{fmt(paso.total)}</p>
              <p style={{ fontSize: '13px', textAlign: 'right', minWidth: '90px', color: 'var(--text-secondary)' }}>{fmt(paso.propuestaConciliacion)}</p>
            </div>
          ))}
        </>
      )}
      
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px' }}>
        <p style={{ fontWeight: '600' }}>Total</p>
        <p style={{ minWidth: '50px' }}></p>
        <p style={{ fontWeight: '600', textAlign: 'right', minWidth: '90px' }}>{fmt(total)}</p>
        <p style={{ fontWeight: '600', textAlign: 'right', minWidth: '90px', color: 'var(--text-secondary)' }}>
          {fmt(desglose.reduce((a, b) => a + b.propuestaConciliacion, 0))}
        </p>
      </div>
    </div>
  )
}