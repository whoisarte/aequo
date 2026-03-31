import { useState } from 'react'
import type { DatosEmpleado, ResultadoCalculo, PeriodoAnual, TipoDocumento } from '@/lib/calculos/types'
import { calcularFiniquito } from '@/lib/calculos/finiquito'
import { calcularLiquidacion } from '@/lib/calculos/liquidacion'
import { validarDatos, type ErroresValidacion } from '@/lib/calculos/validators'

const datosIniciales: DatosEmpleado = {
  nombreEmpleado: '',
  puestoEmpleado: '',
  empresa: '',
  fechaIngreso: '',
  fechaSalida: '',
  tipoDocumento: 'despido',
  periodos: [],
}

export function useCalculadora(porcentajeConciliacion: number = 50) {
  const [datos, setDatos] = useState<DatosEmpleado>(datosIniciales)
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)
  const [errores, setErrores] = useState<ErroresValidacion>({})

  function actualizarDato<K extends keyof DatosEmpleado>(
    campo: K,
    valor: DatosEmpleado[K]
  ) {
    setDatos(prev => ({ ...prev, [campo]: valor }))
  }

  function generarAniosDisponibles(): number[] {
    if (!datos.fechaIngreso || !datos.fechaSalida) return []
    const ingreso = new Date(datos.fechaIngreso)
    const salida = new Date(datos.fechaSalida)
    const anios: number[] = []
    for (let y = ingreso.getFullYear() + 1; y <= salida.getFullYear(); y++) {
      anios.push(y)
    }
    return anios
  }

  function togglePeriodo(anio: number, salarioDiario: number) {
    const existe = datos.periodos.find(p => p.anio === anio)
    if (existe) {
      setDatos(prev => ({ ...prev, periodos: prev.periodos.filter(p => p.anio !== anio) }))
    } else {
      const nuevoPeriodo: PeriodoAnual = {
        anio,
        salarioDiario,
        diasVacacionesUsados: 0,
        aplicaVacaciones: true,
        aplicaPrimaVacacional: true,
        aplicaAguinaldo: true,
      }
      setDatos(prev => ({
        ...prev,
        periodos: [...prev.periodos, nuevoPeriodo].sort((a, b) => a.anio - b.anio),
      }))
    }
  }

  function actualizarPeriodo(anio: number, campo: keyof PeriodoAnual, valor: PeriodoAnual[keyof PeriodoAnual]) {
    setDatos(prev => ({
      ...prev,
      periodos: prev.periodos.map(p => p.anio === anio ? { ...p, [campo]: valor } : p),
    }))
  }

  function calcular() {
    const erroresValidacion = validarDatos(datos)
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    setErrores({})

    const ingreso = new Date(datos.fechaIngreso)
    const salida = new Date(datos.fechaSalida)
    const diffMs = salida.getTime() - ingreso.getTime()
    const diasLaborados = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const aniosCompletos = Math.floor(diasLaborados / 365)
    const diasRestantesDespuesAnios = diasLaborados - aniosCompletos * 365
    const mesesRestantes = Math.floor(diasRestantesDespuesAnios / 30)
    const diasRestantes = diasRestantesDespuesAnios % 30
    const aniosServicio = +(diasLaborados / 365).toFixed(2)

    const finiquito = calcularFiniquito(datos, porcentajeConciliacion)
    const liquidacion = calcularLiquidacion(datos, porcentajeConciliacion)

    setResultado({
      finiquito,
      liquidacion,
      diasLaborados,
      aniosServicio,
      aniosCompletos,
      mesesRestantes,
      diasRestantes,
      tipoDocumento: datos.tipoDocumento,
    })
  }

  function resetear() {
    setDatos(datosIniciales)
    setResultado(null)
    setErrores({})
  }

  return {
    datos,
    resultado,
    errores,
    actualizarDato,
    generarAniosDisponibles,
    togglePeriodo,
    actualizarPeriodo,
    calcular,
    resetear,
  }
}