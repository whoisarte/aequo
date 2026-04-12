import { createClient } from './client'
import type { PostgrestError } from '@supabase/supabase-js'
import type { Branding } from '@/lib/pdf/branding'

const SUPABASE_TIMEOUT_MS = 8000

function timeoutError(message: string): PostgrestError {
  return {
    name: 'PostgrestError',
    message,
    details: '',
    hint: '',
    code: 'TIMEOUT',
  }
}

function timeoutFailure(message: string) {
  return {
    data: null,
    error: timeoutError(message),
    count: null,
    status: 408,
    statusText: 'Request Timeout',
  }
}

async function withTimeout<T>(promise: PromiseLike<T>, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  return new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback)
    }, SUPABASE_TIMEOUT_MS)

    void promise
      .then((value) => {
        if (timer) clearTimeout(timer)
        resolve(value)
      }, () => {
        if (timer) clearTimeout(timer)
        resolve(fallback)
      })
  })
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
        }),
      {
        data: null,
        error: timeoutError('Timeout guardando perfil'),
        count: null,
        status: 408,
        statusText: 'Request Timeout',
      }
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
    const sessionResult = await withTimeout(supabase.auth.getSession(), {
      data: { session: null },
      error: null,
    })
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
      timeoutFailure('Timeout obteniendo perfil')
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

    return {
      status: 'ok',
      perfil: {
        nombreDespacho: data.despacho ?? '',
        nombreAbogado: data.nombre ?? '',
        cedula: data.cedula ?? '',
        correo: data.correo ?? '',
        direccion: data.direccion ?? '',
        logoUrl: data.logo_url ?? '',
        colorPrimario: data.color_primario ?? '#0a0a0a',
        porcentajeConciliacion: data.porcentaje_conciliacion ?? 50,
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
