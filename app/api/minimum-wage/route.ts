import { NextResponse } from 'next/server'
import { container } from '@/lib/di'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || '0', 10)
  const zone = (searchParams.get('zone') || 'general') as 'general' | 'frontera_norte'

  if (!year) {
    return NextResponse.json({ error: 'Year parameter is required' }, { status: 400 })
  }

  const smg = await container.minimumWage.getMinimumWage(year, zone)

  if (smg === null) {
    return NextResponse.json(
      { error: `Minimum wage data not found for year ${year} and zone '${zone}'` },
      { status: 404 }
    )
  }

  return NextResponse.json({ smg })
}
