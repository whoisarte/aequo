'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import moment from 'moment'

interface EventFormProps {
  initialStart: Date | null
  initialEnd: Date | null
  onCancel: () => void
  onSubmit: (eventData: { title: string; description: string; start: Date; end: Date }) => void
}

export default function EventForm({ initialStart, initialEnd, onCancel, onSubmit }: EventFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  useEffect(() => {
    if (initialStart) {
      setStart(moment(initialStart).format('YYYY-MM-DDTHH:mm'));
    }
    if (initialEnd) {
      setEnd(moment(initialEnd).format('YYYY-MM-DDTHH:mm'));
    }
  }, [initialStart, initialEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && start && end) {
      onSubmit({
        title,
        description,
        start: new Date(start),
        end: new Date(end),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-2">
      <Input
        label="Título del Evento"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        ></textarea>
      </div>
      <Input
        label="Inicio"
        name="start"
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        required
        fullWidth
      />
      <Input
        label="Fin"
        name="end"
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        required
        fullWidth
      />
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Evento
        </Button>
      </div>
    </form>
  );
}
