// lib/types/calendar.ts

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  isExpedienteEvent?: boolean; // Flag to identify expediente-related events
  expedienteId?: string; // Original expediente ID
  expedienteInitialTitle?: string | null; // Original conciliation title from expediente
  expedienteInitialDescription?: string | null; // Original conciliation description from expediente
}