import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Import server-side Supabase client

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '0', 10);
  const zone = searchParams.get('zone') || 'general';

  if (!year) {
    return NextResponse.json({ error: 'Year parameter is required' }, { status: 400 });
  }

  const supabase = await createClient(); // Create server-side Supabase client instance

  const { data, error } = await supabase
    .from('minimum_wages')
    .select('daily_wage')
    .eq('year', year)
    .eq('zone', zone)
    .maybeSingle(); // Assumes only one entry per year/zone for simplicity

  if (error) {
    console.error("Error fetching minimum wage from DB:", error);
    return NextResponse.json({ error: 'Failed to fetch minimum wage data' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: `Minimum wage data not found for year ${year} and zone '${zone}'` }, { status: 404 });
  }

  return NextResponse.json({ smg: data.daily_wage });
}