import { create } from 'zustand'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'

interface CalculadoraStore {
  datos: DatosEmpleado
  resultado: ResultadoCalculo | null
  porcentajeConciliacion: number
  setDatos: (datos: DatosEmpleado) => void
  setResultado: (resultado: ResultadoCalculo | null) => void
  setPorcentajeConciliacion: (p: number) => void
  resetear: () => void
}

const datosIniciales: DatosEmpleado = {
  nombreEmpleado: '',
  puestoEmpleado: '',
  empresa: '',
  fechaIngreso: '',
  fechaSalida: '',
  salarioDiario: 0,
  tieneParteProporcional: true,
  diasVacacionesUsados: 0,
}

export const useCalculadoraStore = create<CalculadoraStore>((set) => ({
  datos: datosIniciales,
  resultado: null,
  porcentajeConciliacion: 50,
  setDatos: (datos) => set({ datos }),
  setResultado: (resultado) => set({ resultado }),
  setPorcentajeConciliacion: (p) => set({ porcentajeConciliacion: p }),
  resetear: () => set({ datos: datosIniciales, resultado: null }),
}))