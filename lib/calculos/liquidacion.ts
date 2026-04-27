import type { DatosEmpleado, ResultadoLiquidacion, DesglosePaso } from './types'
import { calcularFiniquito } from './finiquito'

export function calcularLiquidacion(
  datos: DatosEmpleado,
  porcentajeConciliacion: number = 50,
  SMG_value: number // Add this new parameter
): ResultadoLiquidacion {
  const factor = porcentajeConciliacion / 100
  const ingreso = new Date(datos.fechaIngreso + 'T12:00:00')
  const salida = new Date(datos.fechaSalida + 'T12:00:00')
  
  const diffMs = salida.getTime() - ingreso.getTime()
  const diasTotales = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
  const aniosProporcionales = diasTotales / 365

  const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]
  const salarioDiarioBruto = ultimoPeriodo?.salarioDiario ?? 0

  // --- START: Legal Cap Implementation for Prima de Antigüedad ---
  // Use the passed SMG_value
  const topeSalario = +(2 * SMG_value).toFixed(2); // Cap at 2 times SMG

  // Determine the daily salary to use for seniority bonus, applying the cap
  const salarioDiarioParaPrima = Math.min(salarioDiarioBruto, topeSalario);
  // --- END: Legal Cap Implementation ---

  // 1. Indemnización Constitucional (90 días)
  const indemnizacion = +(90 * salarioDiarioBruto).toFixed(2)

  // 2. Prima de Antigüedad (12 días por año, proporcional)
  // These were missing from the previous replace
  const diasPrimaAntiguedad = +(12 * aniosProporcionales).toFixed(2)
  const antiguedad = +(diasPrimaAntiguedad * salarioDiarioParaPrima).toFixed(2)

  const finiquito = calcularFiniquito(datos, porcentajeConciliacion)
  const { periodos } = finiquito

  const desglosePrincipal: DesglosePaso[] = [
    {
      concepto: 'Indemnización Constitucional (90 días)',
      dias: '90',
      total: indemnizacion,
      propuestaConciliacion: +(indemnizacion * factor).toFixed(2),
    },
    {
      concepto: 'Prima de Antigüedad (12 días por año)',
      dias: `${diasPrimaAntiguedad} días`,
      total: antiguedad,
      propuestaConciliacion: +(antiguedad * factor).toFixed(2),
    },
  ]

  const desglosePeriodos: DesglosePaso[] = periodos.flatMap(p => p.desglose)
  const desglose = [...desglosePrincipal, ...desglosePeriodos]

  // Calculate the total for liquidacion by summing up all propuestaConciliacion values
  const total = +desglose.reduce((sum, item) => sum + item.propuestaConciliacion, 0).toFixed(2)

  return {
    indemnizacion,
    diasPrimaAntiguedad, // Store the days calculated
    montoPrimaAntiguedad: antiguedad, // Store the monetary value
    periodos,
    total,
    desglose
  }
}
