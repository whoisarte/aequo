import type { DatosEmpleado, ResultadoLiquidacion, DesglosePaso } from './types'
import { calcularFiniquito } from './finiquito'

export function calcularLiquidacion(
  datos: DatosEmpleado,
  porcentajeConciliacion: number = 50
): ResultadoLiquidacion {
  const factor = porcentajeConciliacion / 100
  const ingreso = new Date(datos.fechaIngreso)
  const salida = new Date(datos.fechaSalida)
  const diffMs = salida.getTime() - ingreso.getTime()
  const diasTotales = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const aniosCompletos = Math.floor(diasTotales / 365)

  const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]
  const salarioBase = ultimoPeriodo?.salarioDiario ?? datos.periodos[0]?.salarioDiario ?? 0

  const indemnizacion = +(90 * salarioBase).toFixed(2)
  const antiguedad = +(20 * aniosCompletos * salarioBase).toFixed(2)

  const finiquito = calcularFiniquito(datos, porcentajeConciliacion)
  const { periodos } = finiquito

  const desglosePrincipal: DesglosePaso[] = [
    {
      concepto: 'Indemnizacion constitucional',
      dias: `90/${Math.round(90 * factor)}`,
      total: indemnizacion,
      propuestaConciliacion: +(indemnizacion * factor).toFixed(2),
    },
    {
      concepto: 'Prima de antiguedad',
      dias: `${20 * aniosCompletos}/${Math.round(20 * aniosCompletos * factor)}`,
      total: antiguedad,
      propuestaConciliacion: +(antiguedad * factor).toFixed(2),
    },
  ]

  const desgloseperiodos: DesglosePaso[] = periodos.flatMap(p => p.desglose)
  const desglose = [...desglosePrincipal, ...desgloseperiodos]

  const totalPeriodos = +periodos.reduce((a, b) => a + b.subtotal, 0).toFixed(2)
  const total = +(indemnizacion + antiguedad + totalPeriodos).toFixed(2)

  return { indemnizacion, antiguedad, periodos, total, desglose }
}