'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'
import { GoogleIcon } from './GoogleIcon'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Memproses...
        </>
      ) : (
        'Daftar'
      )}
    </Button>
  )
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.message || 'Pendaftaran berhasil!')
    }
  }

  async function handleGoogleLogin() {
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-black">Pendaftaran Berhasil!</h2>
        <p className="text-gray-600">{success}</p>
        <Link href="/login">
          <Button className="mt-4">Masuk ke Akun</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form action={handleGoogleLogin}>
        <Button type="submit" variant="outline" className="w-full">
          <GoogleIcon className="w-5 h-5" />
          Daftar dengan Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">atau</span>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ulangi password"
              required
              minLength={6}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      <p className="text-center text-gray-600 text-sm">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-black font-medium hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}
