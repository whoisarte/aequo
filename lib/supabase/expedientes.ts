import { createClient } from './client'
import type { Session } from '@supabase/supabase-js'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'
import type { Tables } from './types'
import { withTimeout, createTimeoutFailure } from '@/lib/utils'

const INITIAL_SESSION_WAIT_MS = 1500

function timeoutFailure(message: string) {
  return createTimeoutFailure(message)
}

function mapExpedienteRow(e: Tables<'expedientes'>): Expediente {
  return {
    id: e.id,
    nombreEmpleado: e.nombre_empleado || '',
    puestoEmpleado: (e.datos_calculo as any)?.puestoEmpleado ?? '',
    empresa: e.empresa ?? '',
    fechaIngreso: (e.datos_calculo as any)?.fechaIngreso ?? '',
    fechaSalida: (e.datos_calculo as any)?.fechaSalida ?? '',
    salarioDiario: (e.datos_calculo as any)?.periodos?.[(e.datos_calculo as any).periodos.length - 1]?.salarioDiario ?? 0,
    tipoDocumento: (e.datos_calculo as any)?.tipoDocumento ?? 'despido',
    resultado: e.resultado as any,
    datosCalculo: e.datos_calculo as any,
    creadoEn: e.created_at || '',
    conciliacionDate: e.conciliacion_date || undefined,
    conciliacionTitle: e.conciliacion_title || undefined,
    conciliacionDescription: e.conciliacion_description || undefined,
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
    if (!session?.user) {
      console.log('guardarExpedienteSupabase: No session found');
      return null;
    }

    console.log('guardarExpedienteSupabase: Attempting insert for user:', session.user.id);
    
    const response = await supabase
        .from('expedientes')
        .insert({
          user_id: session.user.id,
          nombre_empleado: datos.nombreEmpleado,
          empresa: datos.empresa,
          datos_calculo: datos as any,
          resultado: resultado as any,
        })
        .select('*')
        .maybeSingle();

    const { data, error } = response;

    if (error) {
      console.error('guardarExpedienteSupabase: DB Error:', error);
      throw error;
    }
    
    console.log('guardarExpedienteSupabase: Insert success!', data);
    return mapExpedienteRow(data as Tables<'expedientes'>)
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

    return data.map((e) => mapExpedienteRow(e as Tables<'expedientes'>))
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

export async function fetchExpedienteById(id: string): Promise<{ data: Expediente | null; error: Error | null }> {
  try {
    const supabase = createClient()
    const sessionResult = await getSessionWithInitialWait(supabase)
    const { data: { session } } = sessionResult
    if (!session?.user) {
      return { data: null, error: new Error('No active session found.') }
    }

    const response = await withTimeout(
      supabase
        .from('expedientes')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .maybeSingle(),
      timeoutFailure(`Timeout obteniendo expediente con ID: ${id}`)
    )

    const { data, error } = response

    if (error) {
      console.error('fetchExpedienteById: DB Error:', error);
      return { data: null, error: new Error(error.message) }
    }

    if (!data) {
      return { data: null, error: new Error('Expediente no encontrado.') }
    }

    return { data: mapExpedienteRow(data as Tables<'expedientes'>), error: null }
  } catch (err: any) {
    console.error('Error obteniendo expediente por ID:', err);
    return { data: null, error: new Error(err.message || 'Error desconocido') }
  }
}