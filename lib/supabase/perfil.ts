import { createClient } from './client'
import type { Session } from '@supabase/supabase-js'
import type { Branding } from '@/lib/pdf/branding'
import type { Tables } from './types'
import { withTimeout, createTimeoutFailure, createTimeoutSingleFailure } from '@/lib/utils'

const INITIAL_SESSION_WAIT_MS = 1500

function timeoutFailure(message: string) {
  return createTimeoutFailure(message)
}

export type PerfilEstado =
  | { status: 'ok'; perfil: Partial<Branding> }
  | { status: 'empty' }
  | { status: 'no-session' }
  | { status: 'error'; message: string }

export type GuardarPerfilEstado =
  | { status: 'ok' }
  | { status: 'no-session'; message: string }
  | { status: 'error'; message: string }

export async function guardarPerfilSupabase(branding: Branding): Promise<GuardarPerfilEstado> {
  try {
    const supabase = createClient()
    const sessionResult = await withTimeout(supabase.auth.getSession(), {
      data: { session: null },
      error: null,
    })
    const { data: { session } } = sessionResult
    if (!session?.user) {
      return {
        status: 'no-session',
        message: 'Tu sesión no está disponible. Intenta nuevamente.',
      }
    }

    const response = await withTimeout(
      supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          nombre: branding.nombreAbogado,
          despacho: branding.nombreDespacho,
          cedula: branding.cedula,
          correo: branding.correo,
          direccion: branding.direccion,
          logo_url: branding.logoUrl,
          color_primario: branding.colorPrimario,
          porcentaje_conciliacion: branding.porcentajeConciliacion,
          zona_salarial: branding.zonaSalarial, // Add this line
        }),
      createTimeoutSingleFailure<null>('Timeout guardando perfil')
    )

    const { error } = response

    if (error) throw error
    return { status: 'ok' }
  } catch (err) {
    console.error('Error guardando perfil:', err)
    return {
      status: 'error',
      message: 'No se pudo guardar la configuración. Intenta nuevamente.',
    }
  }
}

export async function obtenerPerfilSupabase(): Promise<PerfilEstado> {
  try {
    const supabase = createClient()
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

    const { data: { session } } = sessionResult
    if (!session?.user) {
      return {
        status: 'no-session',
      }
    }

    const response = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle(),
      createTimeoutSingleFailure<Tables<'profiles'>>('Timeout obteniendo perfil')
    )

    const { data, error } = response

    if (error) {
      return {
        status: 'error',
        message: 'No se pudo cargar tu configuración. Intenta nuevamente.',
      }
    }

    if (!data) {
      return {
        status: 'empty',
      }
    }

    const profileData = data as Tables<'profiles'>

    return {
      status: 'ok',
      perfil: {
        nombreDespacho: profileData.despacho ?? '',
        nombreAbogado: profileData.nombre ?? '',
        cedula: profileData.cedula ?? '',
        correo: profileData.correo ?? '',
        direccion: profileData.direccion ?? '',
        logoUrl: profileData.logo_url ?? '',
        colorPrimario: profileData.color_primario ?? '#0a0a0a',
        porcentajeConciliacion: profileData.porcentaje_conciliacion ?? 50,
        zonaSalarial: (profileData.zona_salarial as 'general' | 'frontera_norte' | undefined) ?? 'general', // Explicit cast
      },
    }
  } catch (err) {
    console.error('Error obteniendo perfil:', err)
    return {
      status: 'error',
      message: 'No se pudo cargar tu configuración. Intenta nuevamente.',
    }
  }
}