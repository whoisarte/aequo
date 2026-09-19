import { describe, it, expect } from 'vitest'
import { calcularLiquidacion } from '../liquidacion'
import type { DatosEmpleado } from '../types'

describe('calcularLiquidacion', () => {
  const baseDatosEmpleado: DatosEmpleado = {
    nombreEmpleado: 'Test Employee',
    puestoEmpleado: 'Test Position',
    empresa: 'Test Company',
    fechaIngreso: '2020-01-15',
    fechaSalida: '2025-09-01',
    tipoDocumento: 'despido',
    periodos: [
      {
        anio: 2025,
        salarioDiario: 500,
        diasVacacionesUsados: 0,
        aplicaVacaciones: true,
        aplicaPrimaVacacional: true,
        aplicaAguinaldo: true,
      },
    ],
  }

  const SMG_2025 = 278.80

  describe('indemnizacion constitucional', () => {
    it('calculates 90 days of salary as indemnizacion', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 1000,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datos, 50, SMG_2025)

      // Indemnización = 90 * salarioDiario
      expect(result.indemnizacion).toBe(90000)
    })

    it('applies conciliation factor to indemnizacion', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 1000,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result50 = calcularLiquidacion(datos, 50, SMG_2025)
      const result100 = calcularLiquidacion(datos, 100, SMG_2025)

      const ind50 = result50.desglose.find(d => d.concepto.includes('Indemnización'))
      const ind100 = result100.desglose.find(d => d.concepto.includes('Indemnización'))

      expect(ind50?.propuestaConciliacion).toBe(90000 * 0.5)
      expect(ind100?.propuestaConciliacion).toBe(90000)
    })
  })

  describe('prima de antiguedad', () => {
    it('calculates prima based on years of service', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2020-01-15',
        fechaSalida: '2025-09-01', // ~5.6 years
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datos, 50, SMG_2025)

      expect(result.diasPrimaAntiguedad).toBeGreaterThan(0)
      expect(result.montoPrimaAntiguedad).toBeGreaterThan(0)
    })

    it('caps prima at 2x SMG for salary above the cap', () => {
      const datosHighSalary: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2020-01-15',
        fechaSalida: '2025-09-01', // ~5.6 years
        periodos: [
          {
            anio: 2025,
            salarioDiario: 1000, // Way above SMG (557.6)
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datosHighSalary, 50, SMG_2025)

      // Prima is calculated with capped salary
      expect(result.montoPrimaAntiguedad).toBeGreaterThan(30000) // ~37k
      expect(result.montoPrimaAntiguedad).toBeLessThan(50000) // sanity
    })
  })

  describe('total calculation', () => {
    it('sums all conciliable amounts', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2020-01-01',
        fechaSalida: '2025-12-31',
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datos, 50, SMG_2025)

      // Total should equal sum of all propuestaConciliacion values
      const sumFromDesglose = result.desglose.reduce((sum, item) => sum + item.propuestaConciliacion, 0)
      expect(result.total).toBeCloseTo(sumFromDesglose, 2)
    })

    it('includes finiquito components in total', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datos, 50, SMG_2025)

      // Should have entries from finiquito (vacaciones, prima vacacional, aguinaldo)
      const hasFiniquitoEntries = result.periodos.some(p => p.desglose.length > 0)
      expect(hasFiniquitoEntries).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles short employment period', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2025-01-01',
        fechaSalida: '2025-06-30', // Only 6 months
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datos, 50, SMG_2025)

      expect(result.total).toBeGreaterThan(0)
      expect(result.indemnizacion).toBe(500 * 90) // 90 days always
    })

    it('handles high salary employee (above 2x SMG)', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2020-01-15',
        fechaSalida: '2025-09-01',
        periodos: [
          {
            anio: 2025,
            salarioDiario: 1000, // 3.5x SMG
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularLiquidacion(datos, 50, SMG_2025)

      // Indemnización uses actual salary (90 * 1000 = 90000)
      expect(result.indemnizacion).toBe(90000)
      // Prima is calculated using the capped salary (2 * SMG)
      // with approximately 5.6 years of service
      expect(result.montoPrimaAntiguedad).toBeGreaterThan(0)
      expect(result.montoPrimaAntiguedad).toBeLessThan(50000) // sanity check
    })
  })
})
