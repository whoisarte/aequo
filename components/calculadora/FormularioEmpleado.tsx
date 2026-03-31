'use client'

import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { DatosEmpleado, PeriodoAnual, TipoDocumento } from '@/lib/calculos/types'
import type { ErroresValidacion } from '@/lib/calculos/validators'

type Props = {
  datos: DatosEmpleado
  errores: ErroresValidacion
  aniosDisponibles: number[]
  onCambio: <K extends keyof DatosEmpleado>(campo: K, valor: DatosEmpleado[K]) => void
  onTogglePeriodo: (anio: number, salarioDiario: number) => void
  onActualizarPeriodo: (anio: number, campo: keyof PeriodoAnual, valor: PeriodoAnual[keyof PeriodoAnual]) => void
  onCalcular: () => void
  onResetear: () => void
}

const opcionesTipo: { value: TipoDocumento; label: string }[] = [
  { value: 'despido', label: 'Despido injustificado' },
  { value: 'renuncia', label: 'Renuncia voluntaria' },
  { value: 'ambos', label: 'Ambos' },
]

export default function FormularioEmpleado({
  datos, errores, aniosDisponibles, onCambio, onTogglePeriodo, onActualizarPeriodo, onCalcular, onResetear,
}: Props) {
  const salarioBase = datos.periodos[0]?.salarioDiario || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>

      <Input label="Nombre del empleado" name="nombreEmpleado" value={datos.nombreEmpleado}
        onChange={e => onCambio('nombreEmpleado', e.target.value)} placeholder="Ej. Juan Pérez García" />

      <Input label="Puesto del empleado" name="puestoEmpleado" value={datos.puestoEmpleado}
        onChange={e => onCambio('puestoEmpleado', e.target.value)} placeholder="Ej. Asesor Jurídico" />

      <Input label="Empresa" name="empresa" value={datos.empresa}
        onChange={e => onCambio('empresa', e.target.value)} placeholder="Ej. Constructora XYZ S.A. de C.V." />

      <Input label="Fecha de ingreso" name="fechaIngreso" type="date" value={datos.fechaIngreso}
        onChange={e => onCambio('fechaIngreso', e.target.value)} />
      {errores.fechaIngreso && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '-12px' }}>{errores.fechaIngreso}</p>}

      <Input label="Fecha de salida" name="fechaSalida" type="date" value={datos.fechaSalida}
        onChange={e => onCambio('fechaSalida', e.target.value)} />
      {errores.fechaSalida && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '-12px' }}>{errores.fechaSalida}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Tipo de documento</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {opcionesTipo.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={() => onCambio('tipoDocumento', op.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid',
                borderColor: datos.tipoDocumento === op.value ? 'var(--accent)' : 'var(--border)',
                background: datos.tipoDocumento === op.value ? 'var(--accent)' : 'transparent',
                color: datos.tipoDocumento === op.value ? '#fff' : 'var(--text-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {aniosDisponibles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Periodos con adeudo
          </label>
          {errores.periodos && <p style={{ color: '#dc2626', fontSize: '12px' }}>{errores.periodos}</p>}

          {aniosDisponibles.map(anio => {
            const periodo = datos.periodos.find(p => p.anio === anio)
            const activo = !!periodo

            return (
              <div key={anio} style={{
                border: '1px solid',
                borderColor: activo ? 'var(--accent)' : 'var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}>
                <div
                  onClick={() => onTogglePeriodo(anio, salarioBase)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: activo ? 'var(--accent)' : 'var(--bg-surface)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '500', color: activo ? '#fff' : 'var(--text-primary)' }}>
                    Año {anio}
                  </span>
                  <span style={{ fontSize: '12px', color: activo ? '#fff' : 'var(--text-secondary)' }}>
                    {activo ? 'Activo — clic para quitar' : 'Inactivo — clic para agregar'}
                  </span>
                </div>

                {activo && periodo && (
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input
                      label="Salario diario (MXN)"
                      name={`salario-${anio}`}
                      type="number"
                      value={periodo.salarioDiario === 0 ? '' : String(periodo.salarioDiario)}
                      onChange={e => onActualizarPeriodo(anio, 'salarioDiario', parseFloat(e.target.value) || 0)}
                      placeholder="Ej. 350.00"
                    />
                    <Input
                      label="Días de vacaciones ya usados"
                      name={`vacUsadas-${anio}`}
                      type="number"
                      value={periodo.diasVacacionesUsados === 0 ? '' : String(periodo.diasVacacionesUsados)}
                      onChange={e => onActualizarPeriodo(anio, 'diasVacacionesUsados', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { campo: 'aplicaVacaciones', label: 'Vacaciones' },
                        { campo: 'aplicaPrimaVacacional', label: 'Prima vacacional' },
                        { campo: 'aplicaAguinaldo', label: 'Aguinaldo' },
                      ].map(({ campo, label }) => (
                        <label key={campo} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={periodo[campo as keyof PeriodoAnual] as boolean}
                            onChange={e => onActualizarPeriodo(anio, campo as keyof PeriodoAnual, e.target.checked)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <Button onClick={onCalcular} fullWidth>Calcular</Button>
        <Button onClick={onResetear} variant="secondary">Limpiar</Button>
      </div>
    </div>
  )
}