import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

interface CookieToSet {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')
  const isResetPassword = pathname.startsWith('/reset-password')
  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isEditorRoute = pathname.startsWith('/editor-blog')
  const isAuthCallback = pathname.startsWith('/auth/callback')

  // Allow auth callback to proceed
  if (isAuthCallback) {
    return supabaseResponse
  }

  // Allow reset-password page (user needs to set new password)
  if (isResetPassword) {
    return supabaseResponse
  }

  // Protected routes for authenticated users (dashboard)
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Protected routes for editors only (editor-blog)
  if (isEditorRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Check if user has editor or admin role
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = data as { role: string } | null

    if (profile?.role !== 'editor' && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    
    // Check user role to determine redirect
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = data as { role: string } | null

    // If redirect param exists and user has permission, use it
    if (redirectTo) {
      if (redirectTo.startsWith('/editor-blog') && (profile?.role === 'editor' || profile?.role === 'admin')) {
        url.pathname = redirectTo
      } else if (!redirectTo.startsWith('/editor-blog')) {
        url.pathname = redirectTo
      } else {
        url.pathname = '/dashboard'
      }
    } else {
      // Default redirect based on role
      if (profile?.role === 'editor' || profile?.role === 'admin') {
        url.pathname = '/editor-blog'
      } else {
        url.pathname = '/dashboard'
      }
    }
    
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
