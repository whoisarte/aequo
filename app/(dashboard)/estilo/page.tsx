'use client'

import { useEffect, useState } from 'react'
import { useBrandingStore } from '@/store/brandingStore'
import { guardarPerfilSupabase, obtenerPerfilSupabase } from '@/lib/supabase/perfil'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function EstiloPage() {
  const { branding, setBranding } = useBrandingStore()
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarPerfil() {
      const perfil = await obtenerPerfilSupabase()
      if (perfil) setBranding(perfil)
    }
    cargarPerfil()
  }, [])

  async function handleGuardar() {
    setGuardando(true)
    setMensaje('')
    try {
      const ok = await guardarPerfilSupabase(branding)
      setMensaje(ok ? 'Configuración guardada correctamente' : 'Error al guardar. Intenta de nuevo.')
    } catch (error) {
      console.error('Error guardando perfil:', error)
      setMensaje('Error de conexión. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '560px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Estilo del reporte</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configura la identidad visual de tus PDFs</p>
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Logo del despacho
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {branding.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" style={{ maxWidth: '120px', maxHeight: '60px', objectFit: 'contain', border: '1px solid var(--border)', padding: '4px', borderRadius: '4px' }} />
          )}
          <input 
            type="file" 
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  setBranding({ logoUrl: reader.result as string })
                }
                reader.readAsDataURL(file)
              }
            }}
            style={{ fontSize: '13px' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-hint)' }}>Se recomienda una imagen horizontal con fondo transparente.</p>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Datos del despacho
        </h2>
        <Input label="Nombre del despacho" name="nombreDespacho" value={branding.nombreDespacho}
          onChange={e => setBranding({ nombreDespacho: e.target.value })} placeholder="Ej. López Abogados" />
        <Input label="Nombre del abogado" name="nombreAbogado" value={branding.nombreAbogado}
          onChange={e => setBranding({ nombreAbogado: e.target.value })} placeholder="Ej. Edgardo Tovar López" />
        <Input label="Cédula profesional" name="cedula" value={branding.cedula}
          onChange={e => setBranding({ cedula: e.target.value })} placeholder="Ej. 13123339" />
        <Input label="Correo electrónico" name="correo" type="email" value={branding.correo}
          onChange={e => setBranding({ correo: e.target.value })} placeholder="Ej. contacto@lopezabogados.com" />
        <Input label="Dirección del despacho" name="direccion" value={branding.direccion}
          onChange={e => setBranding({ direccion: e.target.value })} placeholder="Ej. Locutores No. 730, Torreón" />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Propuesta de conciliación
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Porcentaje: {branding.porcentajeConciliacion}%
          </label>
          <input type="range" min={40} max={70} step={5} value={branding.porcentajeConciliacion}
            onChange={e => setBranding({ porcentajeConciliacion: Number(e.target.value) })}
            style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-hint)' }}>
            <span>40%</span><span>70%</span>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Color del encabezado
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="color" value={branding.colorPrimario}
            onChange={e => setBranding({ colorPrimario: e.target.value })}
            style={{ width: '40px', height: '40px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: '2px' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{branding.colorPrimario}</span>
        </div>
      </section>

      {mensaje && (
        <p style={{ fontSize: '13px', color: mensaje.includes('Error') ? '#dc2626' : '#16a34a' }}>
          {mensaje}
        </p>
      )}

      <Button onClick={handleGuardar} disabled={guardando} fullWidth>
        {guardando ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </div>
  )
}