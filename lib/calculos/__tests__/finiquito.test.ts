import { describe, it, expect } from 'vitest'
import { calcularFiniquito } from '../finiquito'
import type { DatosEmpleado } from '../types'

describe('calcularFiniquito', () => {
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

  describe('aguinaldo proporcional', () => {
    it('calculates aguinaldo for full year when employee worked entire year', () => {
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

      const result = calcularFiniquito(datos, 50)

      const aguinaldoEntry = result.desglose.find(d => d.concepto.includes('Aguinaldo'))
      expect(aguinaldoEntry).toBeDefined()
      expect(aguinaldoEntry?.total).toBe(500 * 15) // 15 days of aguinaldo
    })

    it('calculates proportional aguinaldo when employee left mid-year', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2025-01-01',
        fechaSalida: '2025-09-01',
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

      const result = calcularFiniquito(datos, 50)

      const aguinaldoEntry = result.desglose.find(d => d.concepto.includes('Aguinaldo'))
      expect(aguinaldoEntry).toBeDefined()
      expect(aguinaldoEntry?.total).toBeGreaterThan(0)
      expect(aguinaldoEntry?.total).toBeLessThan(500 * 15)
    })
  })

  describe('vacaciones proporcionales', () => {
    it('calculates vacation days based on years of service', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2020-01-15',
        fechaSalida: '2025-09-01',
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

      const result = calcularFiniquito(datos, 50)

      const vacEntry = result.desglose.find(d => d.concepto.includes('Vacaciones'))
      expect(vacEntry).toBeDefined()
      expect(vacEntry?.total).toBeGreaterThan(0)
    })

    it('respects vacation days already taken', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 10,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularFiniquito(datos, 50)

      const vacEntry = result.desglose.find(d => d.concepto.includes('Vacaciones'))
      expect(vacEntry).toBeDefined()
      expect(vacEntry?.total).toBeLessThan(500 * 12)
    })
  })

  describe('prima vacacional', () => {
    it('calculates prima vacacional at 25% of vacation pay', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 400,
            diasVacacionesUsados: 0,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: false,
          },
        ],
      }

      const result = calcularFiniquito(datos, 50)

      const primaEntry = result.desglose.find(d => d.concepto.includes('Prima vacacional'))
      expect(primaEntry).toBeDefined()
      const vacEntry = result.desglose.find(d => d.concepto.includes('Vacaciones'))
      if (vacEntry) {
        expect(primaEntry?.total).toBeCloseTo(vacEntry.total * 0.25, 2)
      }
    })
  })

  describe('beneficios extra', () => {
    it('includes extra benefits when specified', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 0,
            aplicaVacaciones: false,
            aplicaPrimaVacacional: false,
            aplicaAguinaldo: false,
            incluirBeneficiosExtra: true,
            beneficiosExtra: [
              { nombre: 'Bono trimestral', monto: 5000 },
              { nombre: 'Gastos médicos', monto: 3000 },
            ],
          },
        ],
      }

      const result = calcularFiniquito(datos, 50)

      const beneficiosEntry = result.desglose.find(d => d.concepto.includes('Beneficios Extra'))
      expect(beneficiosEntry).toBeDefined()
      expect(beneficiosEntry?.total).toBe(8000)
    })

    it('excludes extra benefits when not specified', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        periodos: [
          {
            anio: 2025,
            salarioDiario: 500,
            diasVacacionesUsados: 0,
            aplicaVacaciones: false,
            aplicaPrimaVacacional: false,
            aplicaAguinaldo: false,
            incluirBeneficiosExtra: false,
            beneficiosExtra: [
              { nombre: 'Bono', monto: 5000 },
            ],
          },
        ],
      }

      const result = calcularFiniquito(datos, 50)

      const beneficiosEntry = result.desglose.find(d => d.concepto.includes('Beneficios Extra'))
      expect(beneficiosEntry).toBeUndefined()
    })
  })

  describe('propuesta de conciliacion', () => {
    it('calculates totals correctly for different conciliation percentages', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2020-01-01',
        fechaSalida: '2025-12-31',
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

      const result100 = calcularFiniquito(datos, 100)
      const result50 = calcularFiniquito(datos, 50)
      const result0 = calcularFiniquito(datos, 0)

      // All should produce valid results
      expect(result100.total).toBeGreaterThan(0)
      expect(result50.total).toBeGreaterThan(0)
      expect(result0.total).toBeGreaterThan(0)

      // The calculation should produce consistent results
      expect(result100.desglose.length).toBeGreaterThan(0)
      expect(result50.desglose.length).toBe(result100.desglose.length)
    })
  })

  describe('edge cases', () => {
    it('handles employee who left in first year', () => {
      const datos: DatosEmpleado = {
        ...baseDatosEmpleado,
        fechaIngreso: '2025-03-01',
        fechaSalida: '2025-09-01',
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

      const result = calcularFiniquito(datos, 50)
      expect(result.total).toBeGreaterThan(0)
    })

    it('handles multiple periods', () => {
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
          {
            anio: 2024,
            salarioDiario: 450,
            diasVacacionesUsados: 5,
            aplicaVacaciones: true,
            aplicaPrimaVacacional: true,
            aplicaAguinaldo: true,
          },
        ],
      }

      const result = calcularFiniquito(datos, 50)
      expect(result.periodos).toHaveLength(2)
      expect(result.total).toBeGreaterThan(0)
    })
  })
})
