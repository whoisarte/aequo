import type { DatosEmpleado, ResultadoFiniquito, ResultadoPeriodo, DesglosePaso } from './types'

export function calcularFiniquito(
  datos: DatosEmpleado,
  porcentajeConciliacion: number = 50
): ResultadoFiniquito {
  const factor = porcentajeConciliacion / 100
  const ingreso = new Date(datos.fechaIngreso + 'T12:00:00')
  const salida = new Date(datos.fechaSalida + 'T12:00:00')

  const updatedPeriodos: ResultadoPeriodo[] = datos.periodos.map(periodo => {
    const desglose: DesglosePaso[] = []
    let vacaciones = 0
    let primaVacacional = 0
    let aguinaldo = 0
    let diasVacEfectivos = 0
    let aguinaldoDias = 0
    let totalBeneficiosExtra = 0;
    let totalBeneficiosExtraConciliable = 0;

    const salarioDiario = periodo.salarioDiario

    // --- AGUINALDO PROPORCIONAL ---
    if (periodo.aplicaAguinaldo) {
      const anioActual = periodo.anio
      const inicioAguinaldo = new Date(anioActual, 0, 1, 12, 0, 0)
      const fechaInicioReal = ingreso > inicioAguinaldo ? ingreso : inicioAguinaldo
      const fechaFinReal = salida
      
      const esAnioSalida = anioActual === salida.getFullYear()
      
      if (esAnioSalida) {
        const diffMs = fechaFinReal.getTime() - fechaInicioReal.getTime()
        const diasLaboradosAnio = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
        const diasDelAnio = (anioActual % 4 === 0 && (anioActual % 100 !== 0 || anioActual % 400 === 0)) ? 366 : 365
        
        aguinaldoDias = +(15 * (diasLaboradosAnio / diasDelAnio)).toFixed(2)
        aguinaldo = +(aguinaldoDias * salarioDiario).toFixed(2)
        
        desglose.push({
          concepto: `Aguinaldo proporcional ${anioActual}`,
          dias: `${diasLaboradosAnio} días laborados`,
          total: aguinaldo,
          propuestaConciliacion: +(aguinaldo * factor).toFixed(2), // Apply factor here
        })
      }
    }

    // --- VACACIONES Y PRIMA VACACIONAL ---
    if (periodo.aplicaVacaciones || periodo.aplicaPrimaVacacional) {
      const anioRelativo = periodo.anio - ingreso.getFullYear()
      if (anioRelativo >= 0) {
        let diasLey = 12
        if (anioRelativo === 0) diasLey = 12
        else if (anioRelativo < 5) diasLey = 12 + (anioRelativo * 2)
        else {
          const bloques5 = Math.floor((anioRelativo - 5) / 5)
          diasLey = 20 + ((bloques5 + 1) * 2)
        }

        const inicioAniversario = new Date(ingreso)
        inicioAniversario.setFullYear(ingreso.getFullYear() + anioRelativo)
        const finAniversario = new Date(inicioAniversario)
        finAniversario.setFullYear(inicioAniversario.getFullYear() + 1)

        const fechaInicioPeriodo = inicioAniversario
        const fechaFinPeriodo = salida < finAniversario ? salida : finAniversario

        if (fechaFinPeriodo > fechaInicioPeriodo) {
          const diffMs = fechaFinPeriodo.getTime() - fechaInicioPeriodo.getTime()
          const diasEnAniversario = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
          const diasTotalesAniversario = Math.floor((finAniversario.getTime() - inicioAniversario.getTime()) / (1000 * 60 * 60 * 24))
          
          const proporcion = diasEnAniversario / diasTotalesAniversario
          diasVacEfectivos = +(diasLey * proporcion).toFixed(2)
          
          const diasPendientes = Math.max(0, diasVacEfectivos - periodo.diasVacacionesUsados)
          
          if (periodo.aplicaVacaciones) {
            vacaciones = +(diasPendientes * salarioDiario).toFixed(2)
            desglose.push({
              concepto: `Vacaciones proporcionales ${periodo.anio}`,
              dias: `${diasPendientes} días`,
              total: vacaciones,
              propuestaConciliacion: +(vacaciones * factor).toFixed(2), // Apply factor here
            })
          }

          if (periodo.aplicaPrimaVacacional) {
            primaVacacional = +(vacaciones * 0.25).toFixed(2)
            desglose.push({
              concepto: `Prima vacacional (25%) ${periodo.anio}`,
              dias: '25%',
              total: primaVacacional,
              propuestaConciliacion: +(primaVacacional * factor).toFixed(2), // Apply factor here
            })
          }
        }
      }
    }

    // --- BENEFICIOS EXTRA ---
    if (periodo.incluirBeneficiosExtra && periodo.beneficiosExtra && periodo.beneficiosExtra.length > 0) {
      totalBeneficiosExtra = periodo.beneficiosExtra.reduce((sum, beneficio) => sum + beneficio.monto, 0)
      totalBeneficiosExtraConciliable = +(totalBeneficiosExtra * factor).toFixed(2)

      desglose.push({
        concepto: `Beneficios Extra Año ${periodo.anio}`,
        dias: `${periodo.beneficiosExtra.length} beneficios`,
        total: totalBeneficiosExtra,
        propuestaConciliacion: totalBeneficiosExtraConciliable,
      })
    }

    // The subtotal for the period is the sum of all conciliable amounts
    const subtotal = desglose.reduce((sum, item) => sum + item.propuestaConciliacion, 0);

    return { anio: periodo.anio, vacaciones, primaVacacional, aguinaldo, subtotal: +subtotal.toFixed(2), desglose }
  })

  const desgloseTotal: DesglosePaso[] = updatedPeriodos.flatMap(p => p.desglose)
  const total = +updatedPeriodos.reduce((a, b) => a + b.subtotal, 0).toFixed(2) // Sum of adjusted subtotals

  return { periodos: updatedPeriodos, total, desglose: desgloseTotal }
}
