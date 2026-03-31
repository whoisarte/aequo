import { createClient } from './client'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'

export async function guardarExpedienteSupabase(
  datos: DatosEmpleado,
  resultado: ResultadoCalculo
): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]

  const { data, error } = await supabase
    .from('expedientes')
    .insert({
      user_id: user.id,
      nombre_empleado: datos.nombreEmpleado,
      puesto_empleado: datos.puestoEmpleado,
      empresa: datos.empresa,
      tipo_documento: datos.tipoDocumento,
      periodos: datos.periodos,
      datos_calculo: datos,
      resultado: resultado,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error guardando expediente:', error)
    return null
  }

  return data.id
}

export async function obtenerExpedientesSupabase(): Promise<Expediente[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('expedientes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(e => ({
    id: e.id,
    nombreEmpleado: e.nombre_empleado,
    puestoEmpleado: e.puesto_empleado ?? '',
    empresa: e.empresa ?? '',
    fechaIngreso: e.datos_calculo?.fechaIngreso ?? '',
    fechaSalida: e.datos_calculo?.fechaSalida ?? '',
    salarioDiario: e.datos_calculo?.periodos?.[e.datos_calculo.periodos.length - 1]?.salarioDiario ?? 0,
    tipoDocumento: e.tipo_documento ?? 'despido',
    resultado: e.resultado,
    creadoEn: e.created_at,
  }))
}

export async function eliminarExpedienteSupabase(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('expedientes')
    .delete()
    .eq('id', id)

  return !error
}