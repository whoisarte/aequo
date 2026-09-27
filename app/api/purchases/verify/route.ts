import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ valid: false, error: 'Missing session_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ valid: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: purchase, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error || !purchase) {
    return NextResponse.json({ valid: false, error: 'Purchase not found' }, { status: 404 })
  }

  return NextResponse.json({ valid: true })
}
