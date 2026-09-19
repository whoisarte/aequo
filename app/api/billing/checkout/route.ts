import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getRateLimitKey } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const ratelimit = rateLimit(getRateLimitKey(ip, '/api/billing/checkout'), {
      maxRequests: 10,
      windowMs: 60000,
    });

    if (!ratelimit.success) {
      return NextResponse.json(
        { error: 'Too many checkout requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((ratelimit.resetAt - Date.now()) / 1000)) } }
      );
    }

    let planId: string;
    let mode: 'subscription' | 'payment' = 'subscription';

    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await req.json();
      planId = body.planId as string;
      mode = (body.mode as 'subscription' | 'payment') || 'subscription';
    } else {
      const formData = await req.formData();
      planId = formData.get('planId') as string;
      mode = (formData.get('mode') as 'subscription' | 'payment') || 'subscription';
    }

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
