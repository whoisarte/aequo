'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const createSupabaseServerActionClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
}

export interface CalendarEventInput {
  title: string
  description?: string
  start: string
  end: string
}

export async function createCalendarEvent(event: CalendarEventInput) {
  const supabase = await createSupabaseServerActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      title: event.title,
      description: event.description || null,
      start_time: event.start,
      end_time: event.end,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating calendar event:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateCalendarEvent(
  eventId: string,
  event: Partial<CalendarEventInput>
) {
  const supabase = await createSupabaseServerActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const updateData: Record<string, unknown> = {}
  if (event.title !== undefined) updateData.title = event.title
  if (event.description !== undefined) updateData.description = event.description || null
  if (event.start !== undefined) updateData.start_time = event.start
  if (event.end !== undefined) updateData.end_time = event.end

  const { data, error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating calendar event:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteCalendarEvent(eventId: string) {
  const supabase = await createSupabaseServerActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting calendar event:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getCalendarEvents() {
  const supabase = await createSupabaseServerActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching calendar events:', error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data }
}
