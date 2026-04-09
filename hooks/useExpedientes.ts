import { useState, useEffect } from 'react'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import {
  guardarExpedienteSupabase,
  obtenerExpedientesSupabase,
  eliminarExpedienteSupabase,
} from '@/lib/supabase/expedientes'

export interface Expediente {
  id: string
  nombreEmpleado: string
  puestoEmpleado: string
  empresa: string
  fechaIngreso: string
  fechaSalida: string
  salarioDiario: number
  tipoDocumento: string
  resultado: ResultadoCalculo
  creadoEn: string
}

const STORAGE_KEY = 'aequo_expedientes'

export function useExpedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    
    // Timeout de seguridad por si Supabase no responde
    const timeout = setTimeout(() => {
      setCargando(false)
    }, 5000)

    try {
      // Intenta cargar desde Supabase
      const remoto = await obtenerExpedientesSupabase()

      if (remoto && remoto.length > 0) {
        setExpedientes(remoto)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoto))
      } else {
        // Fallback a localStorage si no hay remoto o está vacío
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          try {
            setExpedientes(JSON.parse(raw))
          } catch {
            setExpedientes([])
          }
        }
      }
    } catch (error) {
      console.error('Error cargando expedientes:', error)
      // Fallback a localStorage en caso de error de red/auth
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          setExpedientes(JSON.parse(raw))
        } catch {
          setExpedientes([])
        }
      }
    } finally {
      clearTimeout(timeout)
      setCargando(false)
    }
  }

  async function guardar(datos: DatosEmpleado, resultado: ResultadoCalculo) {
    const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]
    const nuevo: Expediente = {
      id: crypto.randomUUID(),
      nombreEmpleado: datos.nombreEmpleado,
      puestoEmpleado: datos.puestoEmpleado,
      empresa: datos.empresa,
      fechaIngreso: datos.fechaIngreso,
      fechaSalida: datos.fechaSalida,
      salarioDiario: ultimoPeriodo?.salarioDiario ?? 0,
      tipoDocumento: datos.tipoDocumento,
      resultado,
      creadoEn: new Date().toISOString(),
    }

    // Actualiza UI inmediatamente (Optimistic UI)
    const actualizados = [nuevo, ...expedientes]
    setExpedientes(actualizados)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados))

    // Intenta sincronizar con Supabase
    try {
      await guardarExpedienteSupabase(datos, resultado)
    } catch (error) {
      console.error('Error sincronizando con Supabase:', error)
    }
  }

  async function eliminar(id: string) {
    const actualizados = expedientes.filter(e => e.id !== id)
    setExpedientes(actualizados)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados))

    await eliminarExpedienteSupabase(id)
  }

  return { expedientes, guardar, eliminar, cargando }
}