import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const planId = formData.get('planId') as string;
    const mode = (formData.get('mode') as 'subscription' | 'payment') || 'subscription';

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await BillingService.createCheckoutSession(
      { planId, mode },
      user.id,
      user.email!,
      req.headers.get('origin') || 'https://aequo.app'
    );

    if (!session?.url) {
      console.error('No checkout URL in session:', session);
      return NextResponse.json({ error: 'Failed to generate checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
