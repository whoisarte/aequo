import { createClient } from './client'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'

// Definición del tipo para la fila de la base de datos
interface ExpedienteRow {
  id: string
  nombre_empleado: string
  empresa: string | null
  datos_calculo: DatosEmpleado
  resultado: ResultadoCalculo
  created_at: string
}

export async function guardarExpedienteSupabase(
  datos: DatosEmpleado,
  resultado: ResultadoCalculo
): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return null

    const { data, error } = await supabase
      .from('expedientes')
      .insert({
        user_id: user.id,
        nombre_empleado: datos.nombreEmpleado, // Corregido el typo aquí
        empresa: datos.empresa,
        datos_calculo: datos,
        resultado: resultado,
      })
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Error guardando expediente:', error)
      return null
    }

    return (data as { id: string } | null)?.id || null
  } catch (err) {
    console.error('Excepción guardando expediente:', err)
    return null
  }
}

export async function obtenerExpedientesSupabase(): Promise<Expediente[]> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return []

    const { data, error } = await supabase
      .from('expedientes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) {
      if (error) console.error('Error obteniendo expedientes:', error)
      return []
    }

    // Casteamos data para que TypeScript conozca sus propiedades en el .map()
    return (data as ExpedienteRow[]).map(e => ({
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
    console.error('Excepción obteniendo expedientes:', err)
    return []
  }
}

export async function eliminarExpedienteSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('expedientes')
      .delete()
      .eq('id', id)

    if (error) console.error('Error eliminando expediente:', error)
    return !error
  } catch (err) {
    console.error('Excepción eliminando expediente:', err)
    return false
  }
}
