'use server'

import { getPricingPlans, getUserSubscription } from '@/lib/services/billing-ui'
import { createClient } from '@/lib/supabase/server'
import { checkAccess } from '@/lib/services/billing-actions'
// Assuming User, Subscription, PricingPlan, GenerationUsage types are defined elsewhere or can be inferred.
// For clarity, let's define the expected structures based on usage.

// Placeholder types if not explicitly imported or defined globally
// In a real scenario, these would be imported or defined properly.
type User = any; 
type Subscription = { plan: any; status: any; current_period_end: any; };
type PricingPlan = { id: string; name: string; description: string | null; price_cents: number; features: string[]; doc_limit: number; currency: string; };
type GenerationUsage = { canGenerate: boolean; used?: number; limit?: number; reason?: string | null; };

// Define the structure for a successful result
type BillingPageSuccessResult = {
  user: User;
  subscription: Subscription | null;
  plans: PricingPlan[];
  generationUsage: GenerationUsage | null;
};

// Define the structure for an error result
type BillingPageErrorResult = {
  error: string;
  user: null;
  subscription: null;
  plans: [];
  generationUsage: null;
};

// Union type for the return value of getBillingPageData
type BillingPageResult = BillingPageSuccessResult | BillingPageErrorResult;


export async function getBillingPageData(): Promise<BillingPageResult> { // Updated return type
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('getBillingPageData: No user found. Returning error structure.') // Log for clarity
      // Return structure conforming to error type
      return {
        error: 'No user session found',
        user: null,
        subscription: null,
        plans: [],
        generationUsage: null
      };
    }

    console.log('getBillingPageData: User found. Fetching subscription, plans, and access status...')

    const subscription = await getUserSubscription(user.id)
    const allPlans = await getPricingPlans()
    const plans = allPlans // Removed filtering of 'individual' plans

    const accessStatus = await checkAccess()

    const resultData: BillingPageSuccessResult = { // Explicitly type success return
      user,
      subscription,
      plans,
      generationUsage: accessStatus
    };
    console.log('getBillingPageData: Fetched data:', JSON.stringify(resultData, null, 2));
    return resultData;
  } catch (error) {
    console.error('getBillingPageData: Error in getBillingPageData:', error);
    // Return structure conforming to error type
    return {
      error: 'Failed to load billing data',
      user: null,
      subscription: null,
      plans: [],
      generationUsage: null
    };
  }
}
