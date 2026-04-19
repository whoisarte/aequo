'use server'

import { getPricingPlans, getUserSubscription } from '@/lib/services/billing-ui'
import { createClient } from '@/lib/supabase/server'
import { checkAccess } from '@/lib/services/billing-actions'

export async function getBillingPageData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, subscription: null, plans: [], generationUsage: null }
    }

    const subscription = await getUserSubscription(user.id)
    const allPlans = await getPricingPlans()
    const plans = allPlans.filter(p => !p.name.toLowerCase().includes('individual'))

    // Get current generation usage
    const accessStatus = await checkAccess()

    return {
      user,
      subscription,
      plans,
      generationUsage: accessStatus
    }
  } catch (error) {
    console.error('Error in getBillingPageData:', error)
    return {
      user: null,
      subscription: null,
      plans: [],
      generationUsage: null,
      error: 'Failed to load billing data'
    }
  }
}

