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

const events = [
  {
    id: 0,
    title: 'Reunión con Cliente A',
    start: new Date(2026, 4, 15, 9, 0, 0), // Year, Month (0-indexed), Day, Hour, Minute, Second
    end: new Date(2026, 4, 15, 10, 30, 0),
  },
  {
    id: 1,
    title: 'Preparar Expediente X',
    start: new Date(2026, 4, 16, 14, 0, 0),
    end: new Date(2026, 4, 16, 16, 0, 0),
  },
  {
    id: 2,
    title: 'Entrega Finiquito Y',
    start: new Date(2026, 4, 20, 11, 0, 0),
    end: new Date(2026, 4, 20, 11, 30, 0),
  },
]

export default function CalendarioPage() {
  const [myEvents, setMyEvents] = useState(events);

  // You can add handlers for selecting slots, events, etc. here
  const handleSelectSlot = ({ start, end }) => {
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

  const handleSelectEvent = (event) => {
    window.alert(event.title)
  }

  return (
    <main>
      <Heading level="h1" className="mb-4">Calendario</Heading>
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
