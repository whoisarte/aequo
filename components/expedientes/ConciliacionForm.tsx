'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import moment from 'moment' // Using moment for date formatting as per existing components
import { useToast } from '@/lib/toast'

interface ConciliacionFormProps {
  expedienteId: string
  initialDate?: string | null
  initialTitle?: string | null
  initialDescription?: string | null
  onCancel: () => void
  onSubmit: (id: string, date?: string, title?: string, description?: string) => void
}

export default function ConciliacionForm({
  expedienteId,
  initialDate,
  initialTitle,
  initialDescription,
  onCancel,
  onSubmit,
}: ConciliacionFormProps) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (initialDate) {
      // Format date to YYYY-MM-DD for input type="date"
      setDate(moment(initialDate).format('YYYY-MM-DD'))
    } else {
      setDate('') // Clear date if no initial date
    }
    setTitle(initialTitle || '')
    setDescription(initialDescription || '')
  }, [initialDate, initialTitle, initialDescription])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!date) {
      toast.error('La fecha de audiencia es requerida.')
      return
    }

    // Convert date to ISO string for database storage
    const formattedDate = date ? moment(date).toISOString() : undefined

    onSubmit(expedienteId, formattedDate, title || undefined, description || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Fecha de Audiencia"
        name="conciliacionDate"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        fullWidth
      />
      <Input
        label="Título (Opcional)"
        name="conciliacionTitle"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <div>
        <label htmlFor="conciliacionDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          id="conciliacionDescription"
          name="conciliacionDescription"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Audiencia
        </Button>
      </div>
    </form>
  )
}