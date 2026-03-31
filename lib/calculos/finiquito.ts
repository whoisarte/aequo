import type { DatosEmpleado, ResultadoFiniquito, ResultadoPeriodo, DesglosePaso } from './types'

export function calcularFiniquito(
  datos: DatosEmpleado,
  porcentajeConciliacion: number = 50
): ResultadoFiniquito {
  const factor = porcentajeConciliacion / 100
  const ingreso = new Date(datos.fechaIngreso)
  const salida = new Date(datos.fechaSalida)
  const diffMs = salida.getTime() - ingreso.getTime()
  const diasTotales = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const aniosCompletos = Math.floor(diasTotales / 365)

  const periodos: ResultadoPeriodo[] = datos.periodos.map(periodo => {
    const esUltimoAnio = periodo.anio === new Date(datos.fechaSalida).getFullYear()
    const inicioAnio = new Date(ingreso)
    inicioAnio.setFullYear(periodo.anio - 1)
    const finAnio = new Date(inicioAnio)
    finAnio.setFullYear(inicioAnio.getFullYear() + 1)

    const diasDelAnio = Math.floor((finAnio.getTime() - inicioAnio.getTime()) / (1000 * 60 * 60 * 24))
    const diasEnPeriodo = esUltimoAnio
      ? Math.floor((salida.getTime() - inicioAnio.getTime()) / (1000 * 60 * 60 * 24))
      : diasDelAnio
    const fraccion = diasEnPeriodo / diasDelAnio

    const aniosTrabajados = periodo.anio - ingreso.getFullYear()
    const diasVacaciones = aniosTrabajados >= 1 ? 12 + (aniosTrabajados - 1) * 2 : 12

    const vacaciones = periodo.aplicaVacaciones
      ? Math.max(0, +((diasVacaciones * fraccion - periodo.diasVacacionesUsados) * periodo.salarioDiario).toFixed(2))
      : 0
    const diasVacEfectivos = periodo.aplicaVacaciones
      ? +(diasVacaciones * fraccion - periodo.diasVacacionesUsados).toFixed(1)
      : 0

    const primaVacacional = periodo.aplicaPrimaVacacional
      ? +(vacaciones * 0.25).toFixed(2)
      : 0

    const aguinaldoDias = +(15 * fraccion).toFixed(1)
    const aguinaldo = periodo.aplicaAguinaldo
      ? +(aguinaldoDias * periodo.salarioDiario).toFixed(2)
      : 0

    const subtotal = +(vacaciones + primaVacacional + aguinaldo).toFixed(2)

    const desglose: DesglosePaso[] = []

    if (periodo.aplicaVacaciones) {
      desglose.push({
        concepto: `Vacaciones ${periodo.anio}`,
        dias: String(diasVacEfectivos),
        total: vacaciones,
        propuestaConciliacion: +(vacaciones * factor).toFixed(2),
      })
    }
    if (periodo.aplicaPrimaVacacional) {
      desglose.push({
        concepto: `Prima vacacional ${periodo.anio}`,
        dias: '25%',
        total: primaVacacional,
        propuestaConciliacion: +(primaVacacional * factor).toFixed(2),
      })
    }
    if (periodo.aplicaAguinaldo) {
      desglose.push({
        concepto: `Aguinaldo ${periodo.anio}`,
        dias: String(aguinaldoDias),
        total: aguinaldo,
        propuestaConciliacion: +(aguinaldo * factor).toFixed(2),
      })
    }

    return { anio: periodo.anio, vacaciones, primaVacacional, aguinaldo, subtotal, desglose }
  })

  const desglose: DesglosePaso[] = periodos.flatMap(p => p.desglose)
  const total = +periodos.reduce((a, b) => a + b.subtotal, 0).toFixed(2)

  return { periodos, total, desglose }
}