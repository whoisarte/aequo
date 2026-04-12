import type { DatosEmpleado, ResultadoLiquidacion, DesglosePaso } from './types'
import { calcularFiniquito } from './finiquito'

export function calcularLiquidacion(
  datos: DatosEmpleado,
  porcentajeConciliacion: number = 50
): ResultadoLiquidacion {
  const factor = porcentajeConciliacion / 100
  const ingreso = new Date(datos.fechaIngreso + 'T12:00:00')
  const salida = new Date(datos.fechaSalida + 'T12:00:00')
  
  const diffMs = salida.getTime() - ingreso.getTime()
  const diasTotales = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
  const aniosProporcionales = diasTotales / 365

  const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]
  const salarioDiario = ultimoPeriodo?.salarioDiario ?? 0

  // 1. Indemnización Constitucional (90 días)
  const indemnizacion = +(90 * salarioDiario).toFixed(2)

  // 2. Prima de Antigüedad (12 días por año, proporcional)
  // Nota: La ley topa el salario para esta prima a 2 salarios mínimos, 
  // pero por ahora usaremos el salario diario para simplicidad o según pida el cliente.
  const diasPrimaAntiguedad = +(12 * aniosProporcionales).toFixed(2)
  const antiguedad = +(diasPrimaAntiguedad * salarioDiario).toFixed(2)

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

  const totalFiniquito = finiquito.total
  const total = +(indemnizacion + antiguedad + totalFiniquito).toFixed(2)

  return { 
    indemnizacion, 
    antiguedad, // Aquí estamos guardando la de 12 días
    periodos, 
    total, 
    desglose 
  }
}
