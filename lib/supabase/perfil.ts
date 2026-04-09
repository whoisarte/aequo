import { createClient } from './client'
import type { Branding } from '@/lib/pdf/branding'

export async function guardarPerfilSupabase(branding: Branding): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Usar getSession en el cliente es mucho más rápido y menos propenso a bloqueos
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
      .maybeSingle() // Usar maybeSingle es más seguro que single() si el perfil no existe

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
    console.error('Error obtenerPerfil:', err)
    return null
  }
}
