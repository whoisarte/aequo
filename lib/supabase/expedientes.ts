import { createClient } from './client'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'

export async function guardarExpedienteSupabase(
  datos: DatosEmpleado,
  resultado: ResultadoCalculo
): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data, error } = await supabase
      .from('expedientes')
      .insert({
        user_id: session.user.id,
        nombre_empleado: datos.nombreEmpleado,
        empresa: datos.empresa,
        datos_calculo: datos,
        resultado: resultado, // Restauramos el guardado del resultado
      })
      .select('id')
      .maybeSingle()

    if (error) throw error
    return data?.id || null
  } catch (err) {
    console.error('Error guardando expediente:', err)
    return null
  }
}

export async function obtenerExpedientesSupabase(): Promise<Expediente[]> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return []

    const { data, error } = await supabase
      .from('expedientes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return (data as any[]).map(e => ({
      id: e.id,
      nombreEmpleado: e.nombre_empleado,
      puestoEmpleado: e.datos_calculo?.puestoEmpleado ?? '',
      empresa: e.empresa ?? '',
      fechaIngreso: e.datos_calculo?.fechaIngreso ?? '',
      fechaSalida: e.datos_calculo?.fechaSalida ?? '',
      salarioDiario: e.datos_calculo?.periodos?.[e.datos_calculo.periodos.length - 1]?.salarioDiario ?? 0,
      tipoDocumento: e.datos_calculo?.tipoDocumento ?? 'despido',
      resultado: e.resultado,
      creadoEn: e.created_at,
    }))
  } catch (err) {
    console.error('Error obteniendo expedientes:', err)
    return []
  }
}

export async function eliminarExpedienteSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('expedientes').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}
