import { createClient } from './client'
import type { Branding } from '@/lib/pdf/branding'

export async function guardarPerfilSupabase(branding: Branding): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      despacho: branding.nombreDespacho,
      nombre_abogado: branding.nombreAbogado,
      cedula: branding.cedula,
      correo: branding.correo,
      direccion: branding.direccion,
      logo_url: branding.logoUrl,
      color_primario: branding.colorPrimario,
      porcentaje_conciliacion: branding.porcentajeConciliacion,
    })

  return !error
}

export async function obtenerPerfilSupabase(): Promise<Partial<Branding> | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return null

  return {
    nombreDespacho: data.despacho ?? '',
    nombreAbogado: data.nombre_abogado ?? '',
    cedula: data.cedula ?? '',
    correo: data.correo ?? '',
    direccion: data.direccion ?? '',
    logoUrl: data.logo_url ?? '',
    colorPrimario: data.color_primario ?? '#0a0a0a',
    porcentajeConciliacion: data.porcentaje_conciliacion ?? 50,
  }
}