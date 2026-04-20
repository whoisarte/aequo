import { useCallback, useEffect, useState } from 'react'
import { getCachedUserId, getExpedientesStorageKey, setCachedUserId } from '@/lib/auth/cache'
import type { DatosEmpleado, ResultadoCalculo } from '@/lib/calculos/types'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/toast/index'
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
  pendiente?: boolean
}

const LOAD_TIMEOUT_MS = 10000

async function obtenerExpedientesConTimeout(): Promise<Expediente[]> {
  let timer: ReturnType<typeof setTimeout> | null = null

  try {
    return await new Promise<Expediente[]>((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error('Tiempo de espera agotado al cargar expedientes'))
      }, LOAD_TIMEOUT_MS)

      void obtenerExpedientesSupabase()
        .then((resultado) => {
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
          resolve(resultado)
        })
        .catch((error) => {
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
          reject(error)
        })
    })
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

export function useExpedientes() {
  const toast = useToast()
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [storageKey, setStorageKey] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const leerExpedientesLocales = useCallback((): Expediente[] => {
    if (!storageKey) return []

    const raw = localStorage.getItem(storageKey)
    if (!raw) return []

    try {
      return JSON.parse(raw) as Expediente[]
    } catch (error) {
      console.error('Error leyendo expedientes locales:', error)
      localStorage.removeItem(storageKey)
      return []
    }
  }, [storageKey])

  useEffect(() => {
    let active = true
    const supabase = createClient()

    const cachedUserId = getCachedUserId()
    if (cachedUserId) {
      setStorageKey(getExpedientesStorageKey(cachedUserId))
    }
    setIsHydrated(true)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return

      if (session?.user.id) {
        setCachedUserId(session.user.id)
        setStorageKey(getExpedientesStorageKey(session.user.id))
      } else {
        setStorageKey(null)
        setExpedientes([])
        setError('')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    if (!storageKey) {
      setCargando(false)
      return
    }

    const locales = leerExpedientesLocales()
    if (locales.length > 0) {
      setExpedientes(locales)
    }
    setCargando(false)
  }, [isHydrated, leerExpedientesLocales, storageKey])

  const cargar = useCallback(async (background = false) => {
    if (!storageKey) {
      setExpedientes([])
      setError('')
      setCargando(false)
      return
    }

    if (!background) {
      setCargando(true)
    }
    setError('')

    try {
      const remoto = await obtenerExpedientesConTimeout()

      if (remoto && remoto.length > 0) {
        setExpedientes(remoto)
        localStorage.setItem(storageKey, JSON.stringify(remoto))
      } else {
        const locales = leerExpedientesLocales()
        setExpedientes(locales)
      }
    } catch (error) {
      console.error('Error cargando expedientes:', error)
      const locales = leerExpedientesLocales()
      setExpedientes(locales)
      setError(
        locales.length > 0
          ? 'No se pudieron actualizar los expedientes remotos. Se muestran los datos locales.'
          : 'No se pudieron cargar los expedientes. Intenta de nuevo.'
      )
    } finally {
      if (!background) {
        setCargando(false)
      }
    }
  }, [leerExpedientesLocales, storageKey])

  useEffect(() => {
    if (!isHydrated || !storageKey) return
    void cargar(leerExpedientesLocales().length > 0)
  }, [cargar, isHydrated, leerExpedientesLocales, storageKey])

  async function guardar(datos: DatosEmpleado, resultado: ResultadoCalculo) {
    console.log('useExpedientes: guardar() was called');
    const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]
    const tempId = crypto.randomUUID()
    const nuevoTemporal: Expediente = {
      id: tempId,
      nombreEmpleado: datos.nombreEmpleado,
      puestoEmpleado: datos.puestoEmpleado,
      empresa: datos.empresa,
      fechaIngreso: datos.fechaIngreso,
      fechaSalida: datos.fechaSalida,
      salarioDiario: ultimoPeriodo?.salarioDiario ?? 0,
      tipoDocumento: datos.tipoDocumento,
      resultado,
      creadoEn: new Date().toISOString(),
      pendiente: true,
    }

    const actualizados = [nuevoTemporal, ...expedientes]
    setExpedientes(actualizados)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(actualizados))
    }

    try {
      const remoto = await guardarExpedienteSupabase(datos, resultado)

      if (!remoto) {
        toast.error('No se pudo guardar el expediente. Intenta nuevamente.')
        return
      }

      const sincronizados = [remoto, ...actualizados.filter((expediente) => expediente.id !== tempId)]
      setExpedientes(sincronizados)
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(sincronizados))
      }

      toast.success(`Expediente guardado: ${datos.nombreEmpleado}`)
    } catch (err) {
      console.error('Error guardando expediente:', err)
      toast.error('Error al guardar el expediente. Por favor intenta nuevamente.')
    }
  }

  async function eliminar(id: string) {
    const expediente = expedientes.find(e => e.id === id)
    const nombreEmpleado = expediente?.nombreEmpleado || 'expediente'
    
    const actualizados = expedientes.filter(e => e.id !== id)
    setExpedientes(actualizados)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(actualizados))
    }

    try {
      await eliminarExpedienteSupabase(id)
      toast.success(`Expediente eliminado: ${nombreEmpleado}`)
    } catch (err) {
      console.error('Error eliminando expediente:', err)
      toast.error('Error al eliminar el expediente. Por favor intenta nuevamente.')
    }
  }

  return { expedientes, guardar, eliminar, cargando, error, recargar: cargar }
}
