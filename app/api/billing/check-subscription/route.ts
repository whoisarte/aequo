import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/billing/check-subscription
 * Checks if current user has an active subscription
 * Used by /billing/success page to verify webhook has processed
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const expectedPlanId = req.nextUrl.searchParams.get('planId')

    if (!user) {
      return NextResponse.json({ isActive: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, plan')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (error) {
      console.error('Error checking subscription:', error)
      return NextResponse.json({ isActive: false, error: 'Database error' }, { status: 500 })
    }

    // Verify if subscription exists and if plan matches (if provided)
    const isActive = !!data && (!expectedPlanId || data.plan.trim() === expectedPlanId.trim())

    return NextResponse.json({
      isActive,
      plan: data?.plan || null,
      message: isActive ? 'Subscription is active' : 'No active subscription found for this plan'
    })
  } catch (error) {
    console.error('Unexpected error in check-subscription:', error)
    return NextResponse.json({ isActive: false, error: 'Server error' }, { status: 500 })
  }
}
