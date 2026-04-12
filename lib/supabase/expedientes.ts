import { createClient } from './client'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'

const SUPABASE_TIMEOUT_MS = 8000

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  return new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback)
    }, SUPABASE_TIMEOUT_MS)

    void promise
      .then((value) => {
        if (timer) clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        if (timer) clearTimeout(timer)
        resolve(fallback)
      })
  })
}

export async function guardarExpedienteSupabase(
  datos: DatosEmpleado,
  resultado: ResultadoCalculo
): Promise<string | null> {
  try {
    const supabase = createClient()
    const sessionResult = await withTimeout(supabase.auth.getSession(), {
      data: { session: null },
      error: null,
    })
    const { data: { session } } = sessionResult
    if (!session?.user) return null

    const response = await withTimeout(
      supabase
        .from('expedientes')
        .insert({
          user_id: session.user.id,
          nombre_empleado: datos.nombreEmpleado,
          empresa: datos.empresa,
          datos_calculo: datos,
          resultado: resultado,
        })
        .select('id')
        .maybeSingle(),
      { data: null, error: new Error('Timeout guardando expediente') }
    )

    const { data, error } = response

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
    const sessionResult = await withTimeout(supabase.auth.getSession(), {
      data: { session: null },
      error: null,
    })
    const { data: { session } } = sessionResult
    if (!session?.user) return []

    const response = await withTimeout(
      supabase
        .from('expedientes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),
      { data: null, error: new Error('Timeout obteniendo expedientes') }
    )

    const { data, error } = response

    if (error || !data) return []

    return data.map((e: {
      id: string
      nombre_empleado: string
      empresa: string | null
      datos_calculo?: {
        puestoEmpleado?: string
        fechaIngreso?: string
        fechaSalida?: string
        tipoDocumento?: string
        periodos?: Array<{ salarioDiario: number }>
      } | null
      resultado: Expediente['resultado']
      created_at: string
    }) => ({
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
    const response = await withTimeout(
      supabase.from('expedientes').delete().eq('id', id),
      { error: new Error('Timeout eliminando expediente') }
    )
    const { error } = response
    return !error
  } catch {
    return false
  }
}
