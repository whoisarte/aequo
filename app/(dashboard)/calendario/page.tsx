'use client'

import { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es' // Import Spanish locale for moment
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'
import Modal from '@/components/ui/Modal' // Import the new Modal component
import EventForm from '@/components/calendario/EventForm' // Import the EventForm component

import './calendar-custom.css'

// Set moment's locale globally if desired, or pass it to localizer
moment.locale('es')
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string; // Add description for events
}

const events: CalendarEvent[] = []

export default function CalendarioPage() {
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>(events);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setSelectedSlot({ start, end });
    setIsModalOpen(true);
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    // For now, just alert. Later, this could open an edit modal
    window.alert(`Evento: ${event.title}\nDescripción: ${event.description || 'N/A'}\nInicio: ${moment(event.start).format('LLL')}\nFin: ${moment(event.end).format('LLL')}`);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot({ start: null, end: null });
  };

  const handleSaveEvent = (eventData: { title: string; description: string; start: Date; end: Date }) => {
    // In a real application, you'd send this data to your API to save to Supabase
    console.log('New event to save:', eventData);
    
    // For now, just add it to local state with a mock ID
    setMyEvents([...myEvents, { ...eventData, id: myEvents.length }]);
    
    handleCloseModal();
  };

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

      {/* Event Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Añadir Nuevo Evento">
        <EventForm
          initialStart={selectedSlot.start}
          initialEnd={selectedSlot.end}
          onCancel={handleCloseModal}
          onSubmit={handleSaveEvent}
        />
      </Modal>
    </main>
  )
}
