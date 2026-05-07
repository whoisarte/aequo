'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation' // Import useRouter
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es' // Import Spanish locale for moment
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'
import { useExpedientes } from '@/hooks/useExpedientes' // Import useExpedientes
import type { Expediente } from '@/hooks/useExpedientes' // Import Expediente type

import './calendar-custom.css'

// Set moment's locale globally if desired, or pass it to localizer
moment.locale('es')
const localizer = momentLocalizer(moment)

import type { CalendarEvent } from '@/lib/types/calendar' // Import CalendarEvent from shared types

// Initial events array - will be combined with expedientes
const initialEvents: CalendarEvent[] = []

export default function CalendarioPage() {
  const router = useRouter() // Initialize useRouter
  const { expedientes, cargando, error, recargar } = useExpedientes() // Fetch expedientes and recargar
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>(initialEvents);

  useEffect(() => {
    if (!cargando && !error && expedientes) {
      const expedienteEvents: CalendarEvent[] = expedientes
        .filter(exp => exp.conciliacionDate) // Only include expedientes with a conciliation date
        .map(exp => ({
          id: exp.id, // Use expediente ID as event ID
          title: `Audiencia: ${exp.nombreEmpleado}${exp.conciliacionTitle ? ` (${exp.conciliacionTitle})` : ''}`,
          start: moment(exp.conciliacionDate!).toDate(),
          end: moment(exp.conciliacionDate!).add(1, 'hour').toDate(), // Assuming a 1-hour duration for simplicity
          description: exp.conciliacionDescription || `Audiencia de conciliación para ${exp.nombreEmpleado}.`,
          isExpedienteEvent: true, // Mark as an expediente event
          expedienteId: exp.id,
          expedienteInitialTitle: exp.conciliacionTitle,
          expedienteInitialDescription: exp.conciliacionDescription,
        }));
      
      setMyEvents([...initialEvents, ...expedienteEvents]);
    }
  }, [expedientes, cargando, error]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date, end: Date, action: 'select' | 'click' | 'doubleClick', bounds?: any, box?: any }) => {
    // Navigate to new-event page for adding generic events
    router.push(`/calendario/new-event?initialStart=${slotInfo.start.toISOString()}&initialEnd=${slotInfo.end.toISOString()}`);
  }, [router]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.isExpedienteEvent && event.expedienteId) {
      // Navigate to conciliation page for editing expediente events
      router.push(`/expedientes/${event.expedienteId}/conciliacion`);
    } else {
      // Navigate to new-event page for editing generic events
      router.push(`/calendario/new-event?initialStart=${event.start.toISOString()}&initialEnd=${event.end.toISOString()}&title=${event.title}&description=${event.description || ''}`);
    }
  }, [router]);

  return (
    <main>
      <Heading level={1} className="mb-4">Calendario</Heading>
      <Card padding="lg" className="h-full">
        <div style={{ height: '700px' }}> {/* Set a height for the calendar */}
          <Calendar
            localizer={localizer}
            events={myEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay eventos en este rango.',
              showMore: total => `+ Ver más (${total})`,
            }}
            selectable // Allows selecting time slots
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            defaultView="month"
          />
        </div>
      </Card>
    </main>
  )
}
