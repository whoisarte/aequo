'use client'

import { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es' // Import Spanish locale for moment
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'
import Popover from '@/components/ui/Popover' // Import the new Popover component
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [popoverX, setPopoverX] = useState(0); // State for Popover X position
  const [popoverY, setPopoverY] = useState(0); // State for Popover Y position

  const handleSelectSlot = (slotInfo: { start: Date, end: Date, action: 'select' | 'click' | 'doubleClick', bounds?: any, box?: any }) => {
    // Use box info if available, otherwise fallback to center of viewport
    if (slotInfo.box) {
        setPopoverX(slotInfo.box.x + window.scrollX); 
        setPopoverY(slotInfo.box.y + window.scrollY); 
    } else {
        // Fallback: position at center of viewport if box info isn't available
        setPopoverX(window.innerWidth / 2 - 150); // -150 to roughly center a 300px wide popover
        setPopoverY(window.innerHeight / 2 - 200); // -200 to roughly center a 400px tall popover
    }
    
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setIsPopoverOpen(true);
  }

  const handleSelectEvent = (event: CalendarEvent, reactEvent: React.SyntheticEvent) => {
    // Position popover near the clicked event
    if (reactEvent && 'clientX' in reactEvent && 'clientY' in reactEvent && reactEvent.nativeEvent) {
        setPopoverX((reactEvent.nativeEvent as MouseEvent).clientX);
        setPopoverY((reactEvent.nativeEvent as MouseEvent).clientY);
    } else {
        setPopoverX(window.innerWidth / 2 - 150);
        setPopoverY(window.innerHeight / 2 - 200);
    }
    setSelectedSlot({ start: event.start, end: event.end }); // Pre-fill with event data for editing
    // For now, still just alert, but future edit modal/popover logic goes here
    window.alert(`Evento: ${event.title}\nDescripción: ${event.description || 'N/A'}\nInicio: ${moment(event.start).format('LLL')}\nFin: ${moment(event.end).format('LLL')}`);
    // setIsPopoverOpen(true); // Uncomment to open popover for existing event editing
  }

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
    setSelectedSlot({ start: null, end: null });
    setPopoverX(0); // Clear coordinates
    setPopoverY(0); // Clear coordinates
  };

  const handleSaveEvent = (eventData: { title: string; description: string; start: Date; end: Date }) => {
    // In a real application, you'd send this data to your API to save to Supabase
    console.log('New event to save:', eventData);
    
    // For now, just add it to local state with a mock ID
    setMyEvents([...myEvents, { ...eventData, id: myEvents.length }]);
    
    handleClosePopover(); // Call the renamed close function
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
            onSelectSlot={handleSelectSlot} // Changed to only pass slotInfo
            onSelectEvent={(event, reactEvent) => handleSelectEvent(event, reactEvent)} // Pass reactEvent
            defaultView="month"
          />
        </div>
      </Card>

      {/* Event Creation Popover */}
      <Popover isOpen={isPopoverOpen} onClose={handleClosePopover} title="Añadir Nuevo Evento" x={popoverX} y={popoverY}>
        <EventForm
          initialStart={selectedSlot.start}
          initialEnd={selectedSlot.end}
          onCancel={handleClosePopover}
          onSubmit={handleSaveEvent}
        />
      </Popover>
    </main>
  )
}
