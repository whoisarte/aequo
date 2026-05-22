import { createClient } from './client'
import type { Session } from '@supabase/supabase-js'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import type { Expediente } from '@/hooks/useExpedientes'
import type { Tables } from './types'
import { withTimeout, createTimeoutFailure, createTimeoutSingleFailure } from '@/lib/utils'


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

import type { PostgrestResponse } from '@supabase/supabase-js'

type SessionResult =
  | { data: { session: Session }; error: null }
  | { data: { session: null }; error: null }
  | { data: { session: null }; error: unknown }

async function getSessionWithInitialWait(supabase: ReturnType<typeof createClient>): Promise<SessionResult> {
  const initialSessionPromise = supabase.auth.getSession().then(
    (response): SessionResult => {
      // Map PostgrestResponse to SessionResult
      if (response.error) {
        return { data: { session: null }, error: response.error };
      }
      // Explicitly check if session exists to return the correct SessionResult union member
      if (response.data.session) {
        return { data: { session: response.data.session }, error: null };
      } else {
        return { data: { session: null }, error: null };
      }
    }
  );

  const timeoutPromise: Promise<SessionResult> = new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        data: { session: null },
        error: new Error('Timeout getting session'),
      });
    }, INITIAL_SESSION_WAIT_MS);
    // Ensure the timer is cleared if initialSessionPromise resolves first
    initialSessionPromise.finally(() => clearTimeout(timer));
  });

  let sessionResult: SessionResult = await Promise.race([
    initialSessionPromise,
    timeoutPromise,
  ]);

  // If the initialSessionPromise resolved with no session,
  // we still might need to wait for onAuthStateChange to fire for INITIAL_SESSION
  // This part of the logic remains largely the same
  if (!sessionResult.data.session) {
    sessionResult = await new Promise<SessionResult>((resolve) => {
      let settled = false

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (settled || event !== 'INITIAL_SESSION') return
        settled = true
        clearTimeout(timer) // clear potential timer from the race condition below if it hasn't fired yet
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
      // This timer is for the onAuthStateChange listener itself,
      // distinct from the one in the Promise.race above.
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        subscription.unsubscribe()
        resolve(sessionResult) // Resolve with current sessionResult if onAuthStateChange doesn't fire in time
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
      timeoutFailure('Timeout obteniendo expedientes') as PostgrestResponse<Tables<'expedientes'>[]>
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
      createTimeoutSingleFailure<null>('Timeout eliminando expediente')
    )
    const { error } = response
    return !error
  } catch {
    return false
  }
}