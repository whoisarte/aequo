'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'
import CalendarFormView from '@/components/calendario/CalendarFormView'
import EventForm from '@/components/calendario/EventForm'
import ConciliacionForm from '@/components/expedientes/ConciliacionForm'
import { useExpedientes } from '@/hooks/useExpedientes'
import { updateExpedienteConciliacion } from '@/lib/services/expedientes-actions.server'
import { createCalendarEvent, updateCalendarEvent, getCalendarEvents } from '@/lib/services/calendar-actions.server'
import { useToast } from '@/lib/toast'

import './calendar-custom.css'

moment.locale('es')
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  isExpedienteEvent?: boolean;
  expedienteId?: string;
  expedienteInitialTitle?: string | null;
  expedienteInitialDescription?: string | null;
}

type ActiveForm =
  | { mode: 'create'; start: Date | null; end: Date | null }
  | { mode: 'edit-event'; event: CalendarEvent }
  | { mode: 'edit-expediente'; event: CalendarEvent }

export default function CalendarioPage() {
  const { expedientes, cargando, error, recargar } = useExpedientes()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarEventsLoading, setCalendarEventsLoading] = useState(true);
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
  const toast = useToast()

  const loadCalendarEvents = useCallback(async () => {
    try {
      const result = await getCalendarEvents()
      if (result.success && result.data) {
        const events: CalendarEvent[] = result.data.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          description: event.description || undefined,
          isExpedienteEvent: false,
        }))
        setCalendarEvents(events)
      }
    } catch (err) {
      console.error('Error loading calendar events:', err)
    } finally {
      setCalendarEventsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCalendarEvents()
  }, [loadCalendarEvents])

  useEffect(() => {
    if (!cargando && !error && expedientes && !calendarEventsLoading) {
      const expedienteEvents: CalendarEvent[] = expedientes
        .filter(exp => exp.conciliacionDate)
        .map(exp => ({
          id: exp.id,
          title: `Audiencia: ${exp.nombreEmpleado}${exp.conciliacionTitle ? ` (${exp.conciliacionTitle})` : ''}`,
          start: moment(exp.conciliacionDate!).toDate(),
          end: moment(exp.conciliacionDate!).add(1, 'hour').toDate(),
          description: exp.conciliacionDescription || `Audiencia de conciliación para ${exp.nombreEmpleado}.`,
          isExpedienteEvent: true,
          expedienteId: exp.id,
          expedienteInitialTitle: exp.conciliacionTitle,
          expedienteInitialDescription: exp.conciliacionDescription,
        }));

      setMyEvents([...expedienteEvents, ...calendarEvents]);
    }
  }, [expedientes, cargando, error, calendarEvents, calendarEventsLoading]);

  const handleSelectSlot = (slotInfo: { start: Date, end: Date }) => {
    setActiveForm({ mode: 'create', start: slotInfo.start, end: slotInfo.end });
  }

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.isExpedienteEvent && event.expedienteId) {
      setActiveForm({ mode: 'edit-expediente', event });
    } else {
      setActiveForm({ mode: 'edit-event', event });
    }
  }, []);

  const handleCloseForm = () => {
    setActiveForm(null);
  };

  const handleSaveEvent = async (eventData: { title: string; description: string; start: Date; end: Date }) => {
    const payload = {
      title: eventData.title,
      description: eventData.description,
      start: eventData.start.toISOString(),
      end: eventData.end.toISOString(),
    }

    const result = activeForm?.mode === 'edit-event'
      ? await updateCalendarEvent(activeForm.event.id, payload)
      : await createCalendarEvent(payload)

    if (result.success) {
      toast.success(activeForm?.mode === 'edit-event' ? 'Evento actualizado correctamente.' : 'Evento creado correctamente.')
      await loadCalendarEvents()
      handleCloseForm()
    } else {
      toast.error(`Error al guardar el evento: ${result.error}`)
    }
  }

  const handleSaveConciliacionEvent = async (id: string, date?: string, title?: string, description?: string) => {
    if (!id) {
      toast.error('Error: Expediente ID es requerido.');
      return;
    }
    const result = await updateExpedienteConciliacion(id, date, title, description);
    if (result.success) {
      toast.success('Fecha de audiencia actualizada correctamente.');
      await recargar();
      handleCloseForm();
    } else {
      toast.error(`Error al actualizar la fecha de audiencia: ${result.error}`);
    }
  };

  let formTitle = 'Añadir Nuevo Evento'
  if (activeForm?.mode === 'edit-event') formTitle = 'Editar Evento'
  else if (activeForm?.mode === 'edit-expediente') formTitle = 'Editar fecha de audiencia'

  return (
    <main>
      <Heading level={1} className="mb-4">Calendario</Heading>
      <Card padding="lg" className="h-full">
        <div style={{ height: '700px' }}>
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
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            defaultView="month"
          />
        </div>
      </Card>

      {activeForm && (
        <CalendarFormView title={formTitle} onClose={handleCloseForm}>
          {activeForm.mode === 'edit-expediente' ? (
            <ConciliacionForm
              expedienteId={activeForm.event.expedienteId!}
              initialDate={moment(activeForm.event.start).toISOString()}
              initialTitle={activeForm.event.expedienteInitialTitle}
              initialDescription={activeForm.event.expedienteInitialDescription}
              onCancel={handleCloseForm}
              onSubmit={handleSaveConciliacionEvent}
            />
          ) : activeForm.mode === 'edit-event' ? (
            <EventForm
              initialTitle={activeForm.event.title}
              initialDescription={activeForm.event.description}
              initialStart={activeForm.event.start}
              initialEnd={activeForm.event.end}
              onCancel={handleCloseForm}
              onSubmit={handleSaveEvent}
            />
          ) : (
            <EventForm
              initialStart={activeForm.start}
              initialEnd={activeForm.end}
              onCancel={handleCloseForm}
              onSubmit={handleSaveEvent}
            />
          )}
        </CalendarFormView>
      )}
    </main>
  )
}
