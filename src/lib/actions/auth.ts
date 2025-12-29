'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    return { error: 'Semua field harus diisi' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name,
      },
      emailRedirectTo: `${APP_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Email sudah terdaftar' }
    }
    return { error: error.message }
  }

  await sendWelcomeEmail(email, name)

  return { 
    success: true, 
    message: 'Pendaftaran berhasil! Silakan cek email untuk verifikasi.' 
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password harus diisi' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email atau password salah' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email belum diverifikasi. Silakan cek inbox email kamu.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || APP_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email harus diisi' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true, 
    message: 'Link reset password telah dikirim ke email kamu.' 
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Password harus diisi' }
  }

  if (password !== confirmPassword) {
    return { error: 'Password tidak cocok' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true, 
    message: 'Password berhasil diubah.' 
  }
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string

  const { error } = await supabase
    .from('profiles')
    .update({ 
      name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Profil berhasil diperbarui' }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const confirmation = formData.get('confirmation') as string

  if (confirmation !== 'DELETE') {
    return { error: 'Konfirmasi tidak valid' }
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

  if (error) {
    return { error: error.message }
  }

  await supabase.auth.signOut()
  redirect('/')
}
