'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Heading from '@/components/ui/Heading'
import EventForm from '@/components/calendario/EventForm'
import { useToast } from '@/lib/toast'
import { addCalendarEvent } from '@/lib/services/calendar-actions.server' // Import the server action

export default function NewEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const initialStartParam = searchParams.get('initialStart')
  const initialEndParam = searchParams.get('initialEnd')
  const initialTitleParam = searchParams.get('title') // Get initial title from query params
  const initialDescriptionParam = searchParams.get('description') // Get initial description from query params

  const [initialStart, setInitialStart] = useState<Date | null>(null)
  const [initialEnd, setInitialEnd] = useState<Date | null>(null)
  const [initialTitle, setInitialTitle] = useState<string | null>(null)
  const [initialDescription, setInitialDescription] = useState<string | null>(null)

  useEffect(() => {
    if (initialStartParam) {
      setInitialStart(new Date(initialStartParam))
    }
    if (initialEndParam) {
      setInitialEnd(new Date(initialEndParam))
    }
    if (initialTitleParam) {
        setInitialTitle(initialTitleParam);
    }
    if (initialDescriptionParam) {
        setInitialDescription(initialDescriptionParam);
    }
  }, [initialStartParam, initialEndParam, initialTitleParam, initialDescriptionParam])

  const handleCancel = () => {
    router.back() // Go back to the calendar page
  }

  const handleSubmit = async (eventData: { title: string; description: string; start: Date; end: Date }) => {
    const result = await addCalendarEvent(eventData);
    if (result.success) {
      toast.success('Evento agregado correctamente.');
      router.back();
    } else {
      toast.error(`Error al agregar evento: ${result.error}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-minus-header p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <Heading level={2} className="mb-6 text-center">
          Añadir Nuevo Evento
        </Heading>
        <EventForm
          initialStart={initialStart}
          initialEnd={initialEnd}
          initialTitle={initialTitle} // Pass initialTitle
          initialDescription={initialDescription} // Pass initialDescription
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

