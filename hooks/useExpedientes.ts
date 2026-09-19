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
  datosCalculo: DatosEmpleado
  creadoEn: string
  conciliacionDate?: string
  conciliacionTitle?: string
  conciliacionDescription?: string
  pendiente?: boolean
  version?: number
  actualizadoEn?: string
}

const LOAD_TIMEOUT_MS = 10000
const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 500

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_BASE_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

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

function mergeExpedientes(local: Expediente[], remote: Expediente[]): Expediente[] {
  const merged = new Map<string, Expediente>()

  for (const exp of remote) {
    merged.set(exp.id, exp)
  }

  for (const exp of local) {
    const existing = merged.get(exp.id)
    if (!existing) {
      merged.set(exp.id, exp)
    } else if (exp.version && existing.version && exp.version > existing.version) {
      merged.set(exp.id, exp)
    } else if (!exp.pendiente && existing.pendiente) {
      merged.set(exp.id, exp)
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  )
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
      resultado: resultado,
      datosCalculo: datos,
      creadoEn: new Date().toISOString(),
      pendiente: true,
      version: 1,
      actualizadoEn: new Date().toISOString(),
    }

    const optimisticallyUpdated = [nuevoTemporal, ...expedientes]
    setExpedientes(optimisticallyUpdated)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(optimisticallyUpdated))
    }

    try {
      const remoto = await retryWithBackoff(
        () => guardarExpedienteSupabase(datos, resultado)
      )

      if (!remoto) {
        toast.error('No se pudo guardar el expediente. Intenta nuevamente.')
        setExpedientes(expedientes)
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(expedientes))
        }
        return
      }

      const synced = [remoto, ...optimisticallyUpdated.filter((e) => e.id !== tempId)]
      const merged = mergeExpedientes(synced, synced)
      setExpedientes(merged)
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(merged))
      }

      toast.success(`Expediente guardado: ${datos.nombreEmpleado}`)
    } catch (err) {
      console.error('Error guardando expediente:', err)
      toast.error('Error al guardar el expediente. Por favor intenta nuevamente.')
      setExpedientes(expedientes)
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(expedientes))
      }
    }
  }

  async function eliminar(id: string) {
    const expediente = expedientes.find(e => e.id === id)
    const nombreEmpleado = expediente?.nombreEmpleado || 'expediente'
    const previousExpedientes = expedientes

    const actualizados = expedientes.filter(e => e.id !== id)
    setExpedientes(actualizados)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(actualizados))
    }

    try {
      await retryWithBackoff(() => eliminarExpedienteSupabase(id))
      toast.success(`Expediente eliminado: ${nombreEmpleado}`)
    } catch (err) {
      console.error('Error eliminando expediente:', err)
      toast.error('Error al eliminar el expediente. Por favor intenta nuevamente.')
      setExpedientes(previousExpedientes)
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(previousExpedientes))
      }
    }
  }

  return { expedientes, guardar, eliminar, cargando, error, recargar: cargar }
}
