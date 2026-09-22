'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'
import Popover from '@/components/ui/Popover'
import EventForm from '@/components/calendario/EventForm'
import ConciliacionForm from '@/components/expedientes/ConciliacionForm'
import { useExpedientes } from '@/hooks/useExpedientes'
import { updateExpedienteConciliacion } from '@/lib/services/expedientes-actions.server'
import { createCalendarEvent, getCalendarEvents } from '@/lib/services/calendar-actions.server'
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

export default function CalendarioPage() {
  const { expedientes, cargando, error, recargar } = useExpedientes()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarEventsLoading, setCalendarEventsLoading] = useState(true);
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [selectedExpedienteEvent, setSelectedExpedienteEvent] = useState<CalendarEvent | null>(null);
  const [popoverX, setPopoverX] = useState(0);
  const [popoverY, setPopoverY] = useState(0);
  const toast = useToast()

  const loadCalendarEvents = useCallback(async () => {
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
    setCalendarEventsLoading(false)
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

  const handleSelectSlot = (slotInfo: { start: Date, end: Date, action: 'select' | 'click' | 'doubleClick', bounds?: any, box?: any }) => {
    setSelectedExpedienteEvent(null);
    if (slotInfo.box) {
        setPopoverX(slotInfo.box.x + window.scrollX);
        setPopoverY(slotInfo.box.y + window.scrollY);
    } else {
        setPopoverX(window.innerWidth / 2 - 150);
        setPopoverY(window.innerHeight / 2 - 200);
    }

    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setIsPopoverOpen(true);
  }

  const handleSelectEvent = useCallback((event: CalendarEvent, reactEvent: React.SyntheticEvent) => {
    if (reactEvent && 'clientX' in reactEvent && 'clientY' in reactEvent && reactEvent.nativeEvent) {
        setPopoverX((reactEvent.nativeEvent as MouseEvent).clientX);
        setPopoverY((reactEvent.nativeEvent as MouseEvent).clientY);
    } else {
        setPopoverX(window.innerWidth / 2 - 150);
        setPopoverY(window.innerHeight / 2 - 200);
    }

    if (event.isExpedienteEvent && event.expedienteId) {
      setSelectedExpedienteEvent(event);
      setSelectedSlot({ start: event.start, end: event.end });
      setIsPopoverOpen(true);
    } else {
      setSelectedExpedienteEvent(null);
      setSelectedSlot({ start: event.start, end: event.end });
      window.alert(`Evento: ${event.title}\nDescripción: ${event.description || 'N/A'}\nInicio: ${moment(event.start).format('LLL')}\nFin: ${moment(event.end).format('LLL')}`);
    }
  }, []);

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
    setSelectedSlot({ start: null, end: null });
    setSelectedExpedienteEvent(null);
    setPopoverX(0);
    setPopoverY(0);
  };

  const handleSaveEvent = async (eventData: { title: string; description: string; start: Date; end: Date }) => {
    const result = await createCalendarEvent({
      title: eventData.title,
      description: eventData.description,
      start: eventData.start.toISOString(),
      end: eventData.end.toISOString(),
    })

    if (result.success) {
      toast.success('Evento creado correctamente.')
      await loadCalendarEvents()
    } else {
      toast.error(`Error al crear evento: ${result.error}`)
    }

    handleClosePopover()
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
    } else {
      toast.error(`Error al actualizar la fecha de audiencia: ${result.error}`);
    }
    handleClosePopover();
  };

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

      <Popover
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        title={selectedExpedienteEvent ? 'Editar fecha de audiencia' : 'Añadir Nuevo Evento'}
        x={popoverX}
        y={popoverY}
      >
        {selectedExpedienteEvent && selectedExpedienteEvent.expedienteId ? (
          <ConciliacionForm
            expedienteId={selectedExpedienteEvent.expedienteId}
            initialDate={moment(selectedExpedienteEvent.start).toISOString()}
            initialTitle={selectedExpedienteEvent.expedienteInitialTitle}
            initialDescription={selectedExpedienteEvent.expedienteInitialDescription}
            onCancel={handleClosePopover}
            onSubmit={handleSaveConciliacionEvent}
          />
        ) : (
          <EventForm
            initialStart={selectedSlot.start}
            initialEnd={selectedSlot.end}
            onCancel={handleClosePopover}
            onSubmit={handleSaveEvent}
          />
        )}
      </Popover>
    </main>
  )
}
