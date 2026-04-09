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
  if (!datos.periodos || datos.periodos.length === 0) {
    errores.periodos = 'Debes agregar al menos un periodo con adeudo'
  }

  return errores
}