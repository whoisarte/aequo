import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'

export interface ProfileRow {
  id: string
  nombre: string | null
  despacho: string | null
  cedula: string | null
  correo: string | null
  direccion: string | null
  logo_url: string | null
  color_primario: string | null
  porcentaje_conciliacion: number | null
  zona_salarial: string | null // Add this line
  created_at: string
}

export interface ExpedienteRow {
  id: string
  user_id: string
  nombre_empleado: string
  empresa: string | null
  datos_calculo: DatosEmpleado | null
  resultado: ResultadoCalculo
  pdf_url: string | null
  created_at: string
}
