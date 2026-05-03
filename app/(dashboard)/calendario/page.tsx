'use client'

import { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es' // Import Spanish locale for moment
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'

import './calendar-custom.css'

// Set moment's locale globally if desired, or pass it to localizer
moment.locale('es')
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const events: CalendarEvent[] = []

export default function CalendarioPage() {
  const [myEvents, setMyEvents] = useState(events);

  // You can add handlers for selecting slots, events, etc. here
  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    const title = window.prompt('Nuevo evento:')
    if (title) {
      const newEvent = {
        id: myEvents.length,
        title,
        start,
        end,
      }
      setMyEvents([...myEvents, newEvent])
    }
  }

  const handleSelectEvent = (event: { title: string }) => {
    window.alert(event.title)
  }

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
