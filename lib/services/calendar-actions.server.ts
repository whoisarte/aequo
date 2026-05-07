'use server'

import { createClient } from '@/lib/supabase/server'
import { createTimeoutFailure, withTimeout } from '@/lib/utils'
import type { CalendarEvent } from '@/lib/types/calendar'

function timeoutFailure(message: string) {
  return createTimeoutFailure(message)
}

interface AddCalendarEventResult {
  success: boolean;
  error?: string;
}

export async function addCalendarEvent(eventData: { title: string; description: string; start: Date; end: Date }): Promise<AddCalendarEventResult> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('addCalendarEvent: Session Error:', sessionError)
      return { success: false, error: sessionError.message }
    }

    if (!session?.user) {
      return { success: false, error: 'No active session found.' }
    }

    // Insert the new event into a 'calendar_events' table (assuming it exists)
    // You might need to create this table in your Supabase schema.
    const response = await withTimeout(
      supabase.from('calendar_events').insert({
        user_id: session.user.id,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start.toISOString(),
        end_date: eventData.end.toISOString(),
      }),
      timeoutFailure('Timeout adding calendar event')
    )

    const { error } = response

    if (error) {
      console.error('addCalendarEvent: DB Error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Error adding calendar event:', err)
    return { success: false, error: err.message || 'An unknown error occurred.' }
  }
}

// You might also need a function to fetch generic calendar events if you want them persisted
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.error('fetchCalendarEvents: Session Error or No User:', sessionError?.message || 'No user')
      return []
    }

    const response = await withTimeout(
      supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('start_date', { ascending: false }),
      timeoutFailure('Timeout fetching calendar events')
    )

    const { data, error } = response

    if (error || !data) {
      console.error('fetchCalendarEvents: DB Error:', error)
      return []
    }

    // Map the database rows to CalendarEvent interface
    return data.map(event => ({
      id: event.id,
      title: event.title || 'Untitled Event',
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      description: event.description || undefined,
      isExpedienteEvent: false, // Mark as generic calendar event
    }))
  } catch (err: any) {
    console.error('Error fetching calendar events:', err)
    return []
  }
}