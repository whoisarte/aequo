import { createClient } from './client'
import type { Branding } from '@/lib/pdf/branding'

// Definición de interfaz para el registro del perfil en DB
interface ProfileRow {
  id: string
  despacho: string | null
  nombre: string | null
  cedula: string | null
  correo: string | null
  direccion: string | null
  logo_url: string | null
  color_primario: string | null
  porcentaje_conciliacion: number | null
}

export async function guardarPerfilSupabase(branding: Branding): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return false

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        despacho: branding.nombreDespacho,
        nombre: branding.nombreAbogado,
        cedula: branding.cedula,
        correo: branding.correo,
        direccion: branding.direccion,
        logo_url: branding.logoUrl,
        color_primario: branding.colorPrimario,
        porcentaje_conciliacion: branding.porcentajeConciliacion,
      })

    if (error) {
      console.error('Error en upsert perfil:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Error guardarPerfil:', err)
    return false
  }
}

export async function obtenerPerfilSupabase(): Promise<Partial<Branding> | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !data) return null

    // Casteo explícito del resultado de Supabase
    const row = data as ProfileRow

    return {
      nombreDespacho: row.despacho ?? '',
      nombreAbogado: row.nombre ?? '',
      cedula: row.cedula ?? '',
      correo: row.correo ?? '',
      direccion: row.direccion ?? '',
      logoUrl: row.logo_url ?? '',
      colorPrimario: row.color_primario ?? '#0a0a0a',
      porcentajeConciliacion: row.porcentaje_conciliacion ?? 50,
    }
  } catch (err) {
    console.error('Error obtenerPerfil:', err)
    return null
  }
}
