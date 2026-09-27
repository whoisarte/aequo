import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getRateLimitKey } from '@/lib/ratelimit';
import { checkoutSchema } from '@/lib/forms/schemas';

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim()
    const ip = forwarded || req.headers.get('x-real-ip') || 'unknown';
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
      const parsed = checkoutSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || 'Datos inválidos' },
          { status: 400 }
        )
      }
      planId = parsed.data.planId
      mode = parsed.data.mode
    } else {
      const formData = await req.formData();
      planId = formData.get('planId') as string;
      mode = (formData.get('mode') as 'subscription' | 'payment') || 'subscription';
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
      }
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
