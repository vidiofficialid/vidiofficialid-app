'use server'

import { createClient } from '@/lib/supabase/server'

export async function editorSignIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password harus diisi' }
  }

  // Step 1: Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email atau password salah' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email belum diverifikasi' }
    }
    return { error: error.message }
  }

  // Step 2: Check if user has editor or admin role
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const profile = profileData as { role: string } | null

  if (profileError || !profile) {
    // Sign out if profile not found
    await supabase.auth.signOut()
    return { error: 'Profil tidak ditemukan' }
  }

  if (profile.role !== 'editor' && profile.role !== 'admin') {
    // Sign out if not editor/admin
    await supabase.auth.signOut()
    return { error: 'Akses ditolak. Hanya untuk editor.' }
  }

  // Success - user is authenticated and has editor role
  return { success: true }
}

export async function editorSignOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
