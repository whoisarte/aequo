import { createClient } from './client'
import type { Branding } from '@/lib/pdf/branding'

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

export async function guardarPerfilSupabase(branding: Branding): Promise<boolean> {
  try {
    const supabase = createClient()
    const sessionResult = await withTimeout(supabase.auth.getSession(), {
      data: { session: null },
      error: null,
    })
    const { data: { session } } = sessionResult
    if (!session?.user) return false

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
      { error: new Error('Timeout guardando perfil') }
    )

    const { error } = response

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error guardando perfil:', err)
    return false
  }
}

export async function obtenerPerfilSupabase(): Promise<Partial<Branding> | null> {
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
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle(),
      { data: null, error: new Error('Timeout obteniendo perfil') }
    )

    const { data, error } = response

    if (error || !data) return null

    return {
      nombreDespacho: data.despacho ?? '',
      nombreAbogado: data.nombre ?? '',
      cedula: data.cedula ?? '',
      correo: data.correo ?? '',
      direccion: data.direccion ?? '',
      logoUrl: data.logo_url ?? '',
      colorPrimario: data.color_primario ?? '#0a0a0a',
      porcentajeConciliacion: data.porcentaje_conciliacion ?? 50,
    }
  } catch (err) {
    console.error('Error obteniendo perfil:', err)
    return null
  }
}
