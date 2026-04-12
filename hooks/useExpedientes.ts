import { useCallback, useEffect, useState } from 'react'
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
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const leerExpedientesLocales = useCallback((): Expediente[] => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    try {
      return JSON.parse(raw) as Expediente[]
    } catch (error) {
      console.error('Error leyendo expedientes locales:', error)
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
  }, [])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const remoto = await obtenerExpedientesConTimeout()

      if (remoto && remoto.length > 0) {
        setExpedientes(remoto)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoto))
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
      setCargando(false)
    }
  }, [leerExpedientesLocales])

  useEffect(() => {
    void cargar()
  }, [cargar])

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

    const actualizados = [nuevo, ...expedientes]
    setExpedientes(actualizados)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados))

    await guardarExpedienteSupabase(datos, resultado)
  }

  async function eliminar(id: string) {
    const actualizados = expedientes.filter(e => e.id !== id)
    setExpedientes(actualizados)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados))
    await eliminarExpedienteSupabase(id)
  }

  return { expedientes, guardar, eliminar, cargando, error, recargar: cargar }
}
