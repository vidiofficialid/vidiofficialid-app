'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Mengirim...
        </>
      ) : (
        'Kirim Link Reset'
      )}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    const result = await forgotPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.message || 'Link reset password telah dikirim!')
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-black">Email Terkirim!</h2>
        <p className="text-gray-600">{success}</p>
        <p className="text-sm text-gray-500">
          Tidak menerima email? Cek folder spam atau{' '}
          <button onClick={() => setSuccess(null)} className="text-black font-medium hover:underline">
            kirim ulang
          </button>
        </p>
        <Link href="/login">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-black mb-2">Lupa Password?</h2>
        <p className="text-gray-600 text-sm">
          Masukkan email kamu dan kami akan mengirimkan link untuk reset password.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
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

        <SubmitButton />
      </form>

      <p className="text-center text-gray-600 text-sm">
        Ingat password?{' '}
        <Link href="/login" className="text-black font-medium hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}
