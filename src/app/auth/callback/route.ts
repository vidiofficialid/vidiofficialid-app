import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if this is a new user (email confirmation)
      const isNewUser = data.user.created_at === data.user.updated_at ||
                        new Date(data.user.created_at).getTime() > Date.now() - 60000

      if (isNewUser) {
        // Redirect to confirmation page for new users
        const email = encodeURIComponent(data.user.email || '')
        return NextResponse.redirect(`${origin}/confirm?email=${email}`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
