'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

interface CookieToSet {
  name: string
  value: string
  options?: Record<string, unknown>
}

async function createSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}

export async function editorSignIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password harus diisi' }
  }

  const supabase = await createSupabaseClient()

  // Step 1: Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    if (authError.message.includes('Invalid login credentials')) {
      return { error: 'Email atau password salah' }
    }
    if (authError.message.includes('Email not confirmed')) {
      return { error: 'Email belum diverifikasi' }
    }
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Login gagal' }
  }

  // Step 2: Get fresh session to ensure cookies are set
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session) {
    return { error: 'Session tidak valid' }
  }

  // Step 3: Query profile with the authenticated user
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', authData.user.id)
    .single()

  // Debug: log the error if any
  if (profileError) {
    console.error('Profile query error:', profileError)
    
    // If RLS blocks, try to check if profile exists at all
    // This could mean profile wasn't created
    await supabase.auth.signOut()
    return { 
      error: `Profil tidak ditemukan. Error: ${profileError.message}` 
    }
  }

  if (!profileData) {
    await supabase.auth.signOut()
    return { error: 'Data profil kosong' }
  }

  const profile = profileData as { id: string; email: string; role: string }

  // Step 4: Check role
  if (profile.role !== 'editor' && profile.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'Akses ditolak. Hanya untuk editor.' }
  }

  // Success
  return { success: true }
}

export async function editorSignOut() {
  const supabase = await createSupabaseClient()
  await supabase.auth.signOut()
}
