import { useState } from 'react'
import type { DatosEmpleado, ResultadoCalculo, PeriodoAnual, TipoDocumento } from '@/lib/calculos/types'
import { calcularFiniquito } from '@/lib/calculos/finiquito'
import { calcularLiquidacion } from '@/lib/calculos/liquidacion'
import { validarDatos, type ErroresValidacion } from '@/lib/calculos/validators'
import { useBrandingStore } from '@/store/brandingStore' // Add this import

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
  const { branding } = useBrandingStore() // Access branding store
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
    for (let y = ingreso.getFullYear(); y <= salida.getFullYear(); y++) {
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
        incluirBeneficiosExtra: false, // Initialize new field
        beneficiosExtra: [], // Initialize new field
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

  function actualizarBeneficiosExtra(anio: number, beneficios: { nombre: string; monto: number }[]) {
    setDatos(prev => ({
      ...prev,
      periodos: prev.periodos.map(p => p.anio === anio ? { ...p, beneficiosExtra: beneficios } : p),
    }))
  }

  async function calcular() {
    const erroresValidacion = validarDatos(datos)
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    setErrores({})

    const ingreso = new Date(datos.fechaIngreso)
    const salida = new Date(datos.fechaSalida)
    const diffMs = salida.getTime() - ingreso.getTime()
    const diasLaborados = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
    const aniosCompletos = Math.floor(diasLaborados / 365)
    const diasRestantesDespuesAnios = diasLaborados - aniosCompletos * 365
    const mesesRestantes = Math.floor(diasRestantesDespuesAnios / 30)
    const diasRestantes = diasRestantesDespuesAnios % 30
    const aniosServicio = Math.floor(diasLaborados / 365)

    // --- Fetch SMG for liquidacion calculation ---
    let SMG_value = 0; // Default to 0 or handle as error
    if (datos.fechaSalida) {
      const yearSalida = new Date(datos.fechaSalida).getFullYear();
      try {
        const response = await fetch(`/api/minimum-wage?year=${yearSalida}&zone=${branding.zonaSalarial || 'general'}`); // Use stored zonaSalarial
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch minimum wage');
        }
        const data = await response.json();
        SMG_value = data.smg;
      } catch (error) {
        console.error("Error fetching minimum wage:", error);
        // Optionally, set an error state or toast notification
        // For now, proceed with SMG_value = 0 (or a sensible fallback)
      }
    }
    // --- End Fetch SMG ---

    const finiquito = calcularFiniquito(datos, porcentajeConciliacion)
    const liquidacion = calcularLiquidacion(datos, porcentajeConciliacion, SMG_value) // Pass SMG_value

    setResultado({
      finiquito,
      liquidacion,
      diasLaborados,
      aniosServicio,
      aniosCompletos,
      mesesRestantes,
      diasRestantes,
      tipoDocumento: datos.tipoDocumento,
      datosCalculo: datos,
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
    actualizarBeneficiosExtra, // Expose new function
    calcular,
    resetear,
  }
}