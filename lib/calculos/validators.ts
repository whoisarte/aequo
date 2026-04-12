import type { DatosEmpleado } from './types'

export interface ErroresValidacion {
  fechaIngreso?: string
  fechaSalida?: string
  periodos?: string
}

export function validarDatos(datos: DatosEmpleado): ErroresValidacion {
  const errores: ErroresValidacion = {}

  if (!datos.fechaIngreso) {
    errores.fechaIngreso = 'La fecha de ingreso es requerida'
  }
  if (!datos.fechaSalida) {
    errores.fechaSalida = 'La fecha de salida es requerida'
  }
  if (datos.fechaIngreso && datos.fechaSalida) {
    const ingreso = new Date(datos.fechaIngreso)
    const salida = new Date(datos.fechaSalida)
    if (salida < ingreso) {
      errores.fechaSalida = 'La fecha de salida debe ser igual o posterior al ingreso'
    }
  }

  // La validación de periodos obligatorios se mantiene eliminada 
  // para permitir cálculos de rangos cortos.

  return errores
}
