import { createClient } from './client'
import type { Session } from '@supabase/supabase-js'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'
import type { ExpedienteRow } from './types'
import { withTimeout, createTimeoutFailure } from '@/lib/utils'

const INITIAL_SESSION_WAIT_MS = 1500

function timeoutFailure(message: string) {
  return createTimeoutFailure(message)
}

function mapExpedienteRow(e: ExpedienteRow): Expediente {
  return {
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
  }
}

async function getSessionWithInitialWait(supabase: ReturnType<typeof createClient>) {
  type SessionResult =
    | { data: { session: Session }; error: null }
    | { data: { session: null }; error: null }
    | { data: { session: null }; error: unknown }

  let sessionResult: SessionResult = await withTimeout(supabase.auth.getSession(), {
    data: { session: null },
    error: null,
  })

  if (!sessionResult.data.session) {
    sessionResult = await new Promise<SessionResult>((resolve) => {
      let settled = false

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (settled || event !== 'INITIAL_SESSION') return
        settled = true
        clearTimeout(timer)
        subscription.unsubscribe()
        if (session) {
          resolve({
            data: { session },
            error: null,
          })
        } else {
          resolve({
            data: { session: null },
            error: null,
          })
        }
      })

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        subscription.unsubscribe()
        resolve(sessionResult)
      }, INITIAL_SESSION_WAIT_MS)
    })
  }

  return sessionResult
}

export async function guardarExpedienteSupabase(
  datos: DatosEmpleado,
  resultado: ResultadoCalculo
): Promise<Expediente | null> {
  try {
    const supabase = createClient()
    const sessionResult = await getSessionWithInitialWait(supabase)
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
        .select('*')
        .maybeSingle(),
      timeoutFailure('Timeout guardando expediente')
    )

    const { data, error } = response

    if (error || !data) throw error ?? new Error('No se pudo guardar el expediente')
    return mapExpedienteRow(data as ExpedienteRow)
  } catch (err) {
    console.error('Error guardando expediente:', err)
    return null
  }
}

export async function obtenerExpedientesSupabase(): Promise<Expediente[]> {
  try {
    const supabase = createClient()
    const sessionResult = await getSessionWithInitialWait(supabase)
    const { data: { session } } = sessionResult
    if (!session?.user) return []

    const response = await withTimeout(
      supabase
        .from('expedientes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),
      timeoutFailure('Timeout obteniendo expedientes')
    )

    const { data, error } = response

    if (error || !data) return []

    return data.map((e) => mapExpedienteRow(e as ExpedienteRow))
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
      timeoutFailure('Timeout eliminando expediente')
    )
    const { error } = response
    return !error
  } catch {
    return false
  }
}
