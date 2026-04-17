import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const planId = formData.get('planId') as string;
  const mode = (formData.get('mode') as 'subscription' | 'payment') || 'subscription';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const session = await BillingService.createCheckoutSession(
      { planId, mode },
      user.id,
      user.email!,
      req.headers.get('origin')!
    );

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
