'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Heading from '@/components/ui/Heading'
import ConciliacionForm from '@/components/expedientes/ConciliacionForm'
import { updateExpedienteConciliacion } from '@/lib/services/expedientes-actions.server'
import { fetchExpedienteById } from '@/lib/supabase/expedientes' // Assuming this function exists or will be created
import { useToast } from '@/lib/toast'
import type { Expediente } from '@/hooks/useExpedientes' // Reusing Expediente type

export default function ConciliacionPage() {
  const router = useRouter()
  const params = useParams()
  const expedienteId = params.id as string

  const [expediente, setExpediente] = useState<Expediente | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (expedienteId) {
      const loadExpediente = async () => {
        setLoading(true)
        const { data, error } = await fetchExpedienteById(expedienteId)
        if (error) {
          toast.error(`Error al cargar expediente: ${error.message}`)
          router.back() // Go back if expediente not found or error
        } else {
          setExpediente(data)
        }
        setLoading(false)
      }
      loadExpediente()
    } else {
      router.back() // Go back if no ID is provided
    }
  }, [expedienteId, router, toast])

  const handleCancel = () => {
    router.back() // Go back to the previous page (expedientes list)
  }

  const handleSubmit = async (id: string, date?: string, title?: string, description?: string) => {
    const result = await updateExpedienteConciliacion(id, date, title, description)
    if (result.success) {
      toast.success('Fecha de audiencia actualizada correctamente.')
      router.back() // Go back after successful update
    } else {
      toast.error(`Error al actualizar la fecha de audiencia: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-minus-header">
        <p>Cargando expediente...</p>
      </div>
    )
  }

  if (!expediente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-minus-header">
        <Heading level={1}>Expediente no encontrado</Heading>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-minus-header p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <Heading level={2} className="mb-6 text-center">
          {expediente.conciliacionDate ? 'Editar fecha de audiencia' : 'Agregar fecha de audiencia'}
        </Heading>
        <ConciliacionForm
          expedienteId={expediente.id}
          initialDate={expediente.conciliacionDate}
          initialTitle={expediente.conciliacionTitle}
          initialDescription={expediente.conciliacionDescription}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
