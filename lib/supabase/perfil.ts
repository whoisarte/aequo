import { createClient } from './client'
import type { Branding } from '@/lib/pdf/branding'

export async function guardarPerfilSupabase(branding: Branding): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return false

    const { error } = await supabase
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
      })

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

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
