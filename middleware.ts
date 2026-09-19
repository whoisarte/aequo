import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/calculadora', '/expedientes', '/estilo', '/reporte', '/billing']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'local'

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_anon_key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null

  if (appMode === 'local') {
    const mockUserId = request.cookies.get('mock_user_id')?.value
    if (mockUserId) {
      user = { id: mockUserId, email: 'mock@example.com' }
    }
  } else {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const isProtectedRoute = protectedRoutes.some(route =>
    path.startsWith(route)
  )

  if (!user && isProtectedRoute) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
