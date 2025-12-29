'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        'Reset Password'
      )}
    </Button>
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-black">Password Berhasil Diubah!</h2>
        <p className="text-gray-600">Mengalihkan ke halaman login...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-black mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm">Masukkan password baru kamu.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password Baru</Label>
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
        <Link href="/login" className="text-black font-medium hover:underline">
          Kembali ke Login
        </Link>
      </p>
    </div>
  )
}
