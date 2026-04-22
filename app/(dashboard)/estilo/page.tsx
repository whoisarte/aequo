'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getCachedBranding, getCachedUserId } from '@/lib/auth/cache'
import { useBrandingStore } from '@/store/brandingStore'
import { guardarPerfilSupabase, obtenerPerfilSupabase } from '@/lib/supabase/perfil'
import { useToast } from '@/lib/toast/index'
import { deleteUserAccountAction } from '@/lib/services/user-actions.server'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function EstiloPage() {
  const { branding, setBranding } = useBrandingStore()
  const toast = useToast()
  const router = useRouter()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')
  const isMounted = useRef(false)
  const isLoadingProfile = useRef(false)
  const retryLoadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasCachedBranding = useRef(false)

  const cargarPerfil = useCallback(async (background = false) => {
    if (isLoadingProfile.current) return

    isLoadingProfile.current = true
    if (!background) {
      setCargando(true)
    }
    setErrorCarga('')

    try {
      const resultado = await obtenerPerfilSupabase()
      if (!isMounted.current) return

      if (resultado.status === 'ok') {
        setBranding(resultado.perfil)
        return
      }

      if (resultado.status === 'empty') {
        return
      }

      if (resultado.status === 'no-session') {
        const cachedUserId = getCachedUserId()
        if (cachedUserId) {
          retryLoadTimer.current = setTimeout(() => {
            if (isMounted.current) {
              void cargarPerfil(true)
            }
          }, 800)
          return
        }
        setErrorCarga('Tu sesión no está disponible en este momento. Intenta nuevamente.')
        return
      }

      setErrorCarga(resultado.message)
    } catch (error) {
      console.error('Error cargando perfil:', error)
      if (isMounted.current) {
        setErrorCarga('No se pudo cargar la configuración. Intenta nuevamente.')
      }
    } finally {
      isLoadingProfile.current = false
      if (isMounted.current && !background) {
        setCargando(false)
      }
    }
  }, [setBranding])

  useEffect(() => {
    isMounted.current = true

    const userId = getCachedUserId()
    if (userId) {
      const brandingCacheado = getCachedBranding(userId)
      if (brandingCacheado) {
        hasCachedBranding.current = true
        setBranding(brandingCacheado)
        setCargando(false)
      }
    }

    void cargarPerfil(hasCachedBranding.current)

    return () => {
      isMounted.current = false
      if (retryLoadTimer.current) {
        clearTimeout(retryLoadTimer.current)
      }
    }
  }, [cargarPerfil, setBranding])

  async function handleGuardar() {
    if (guardando) return

    setGuardando(true)

    let timeoutActivo = true
    const timer = setTimeout(() => {
      if (!timeoutActivo || !isMounted.current) return
      setGuardando(false)
      toast.warning('La operación está tardando más de lo esperado.')
    }, 15000)

    try {
      const resultado = await guardarPerfilSupabase(branding)
      if (!isMounted.current) return

      if (resultado.status === 'ok') {
        toast.success('Configuración guardada correctamente')
        setErrorCarga('')
      } else if (resultado.status === 'no-session') {
        toast.error(resultado.message)
        setErrorCarga(resultado.message)
      } else {
        toast.error(resultado.message)
      }
    } catch (error) {
      console.error('Error en handleGuardar:', error)
      if (isMounted.current) {
        toast.error('Ocurrió un error inesperado al guardar.')
      }
    } finally {
      timeoutActivo = false
      clearTimeout(timer)
      if (isMounted.current) {
        setGuardando(false)
      }
    }
  }

  async function handleEliminarCuenta() {
    if (!window.confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción eliminará permanentemente tu cuenta, todos tus expedientes guardados y cancelará cualquier suscripción activa. Esta acción no se puede deshacer.')) {
      return
    }

    const confirmacion = window.prompt('Para confirmar, escribe "ELIMINAR" en el siguiente campo:')
    if (confirmacion !== 'ELIMINAR') {
      toast.error('Confirmación incorrecta. La cuenta no fue eliminada.')
      return
    }

    setEliminando(true)
    try {
      const result = await deleteUserAccountAction()
      if (result.success) {
        toast.success('Tu cuenta ha sido eliminada. Lamentamos verte partir.')
        router.push('/login')
      } else {
        toast.error(result.error || 'No se pudo eliminar la cuenta.')
      }
    } catch (error) {
      console.error('Error in handleEliminarCuenta:', error)
      toast.error('Ocurrió un error inesperado al intentar eliminar la cuenta.')
    } finally {
      setEliminando(false)
    }
  }

  if (cargando) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '560px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Estilo del reporte</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configura la identidad visual de tus PDFs</p>
      </div>

      {errorCarga && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid #fecaca', background: '#fef2f2' }}>
          <p style={{ fontSize: '13px', color: '#b91c1c' }}>{errorCarga}</p>
          <div>
            <button
              type="button"
              onClick={() => void cargarPerfil()}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid #fecaca',
                background: '#fff',
                color: '#991b1b',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

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

      <Button onClick={handleGuardar} disabled={guardando} fullWidth>
        {guardando ? 'Guardando...' : 'Guardar configuración'}
      </Button>

      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #fee2e2' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#b91c1c', marginBottom: '8px' }}>Zona de peligro</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
        </p>
        <Button 
          variant="secondary" 
          onClick={handleEliminarCuenta} 
          disabled={eliminando}
          style={{ borderColor: '#fecaca', color: '#b91c1c' }}
        >
          {eliminando ? 'Eliminando cuenta...' : 'Eliminar mi cuenta permanentemente'}
        </Button>
      </div>
    </div>
  )
}
