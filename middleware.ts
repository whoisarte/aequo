import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const timestamp = new Date().toLocaleTimeString()
  const path = request.nextUrl.pathname
  
  // Ignorar archivos estáticos para no saturar los logs
  const isStatic = path.includes('_next') || path.includes('favicon')
  if (!isStatic) console.log(`[${timestamp}] [MIDDLEWARE] Iniciando para: ${path}`)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  if (!isStatic) console.log(`[${timestamp}] [MIDDLEWARE] Ejecutando getUser()...`)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!isStatic) console.log(`[${timestamp}] [MIDDLEWARE] getUser() completado. User: ${user?.id ? 'OK' : 'NULL'}`)

  const isProtectedRoute = ['/calculadora', '/expedientes', '/estilo', '/reporte'].some(route => 
    path.startsWith(route)
  )

  if (!user && isProtectedRoute) {
    if (!isStatic) console.log(`[${timestamp}] [MIDDLEWARE] Redirigiendo a /login (Protegido)`)
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
