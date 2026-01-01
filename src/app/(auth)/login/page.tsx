'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signInWithGoogle } from '@/lib/actions/auth'
import { GoogleIcon } from '@/components/auth/GoogleIcon'

function SubmitButton({ isLocked }: { isLocked: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <motion.div
      whileHover={{ scale: pending || isLocked ? 1 : 1.02 }}
      whileTap={{ scale: pending || isLocked ? 1 : 0.98 }}
    >
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        disabled={pending || isLocked}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses...
          </>
        ) : isLocked ? (
          'Terlalu banyak percobaan'
        ) : (
          'Masuk'
        )}
      </Button>
    </motion.div>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value && !validateEmail(value)) {
      setEmailError('Format email tidak valid')
    } else {
      setEmailError('')
    }
  }

  async function handleSubmit(formData: FormData) {
    if (isLocked) return
    
    setError(null)
    const email = formData.get('email') as string
    
    if (!validateEmail(email)) {
      setEmailError('Format email tidak valid')
      return
    }

    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 5) {
        setIsLocked(true)
        setTimeout(() => {
          setAttempts(0)
          setIsLocked(false)
        }, 300000) // 5 minutes
      }
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    setError(null)
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
    }
    setIsGoogleLoading(false)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <Link href="/">
                <Image
                  src="https://res.cloudinary.com/dsv8iy2la/image/upload/v1766922503/logo_k0q2cc.png"
                  alt="Vidi Official Logo"
                  width={80}
                  height={80}
                  className="h-20 w-auto mx-auto"
                />
              </Link>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl mb-3 text-gray-900 font-bold"
            >
              VidiOfficialID
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-600 max-w-sm mx-auto"
            >
              Platform video testimoni yang membantu UMKM Indonesia mendapatkan kepercayaan pelanggan
            </motion.p>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <h2 className="text-2xl text-center mb-6 text-gray-800 font-semibold">
              Masuk ke Akun
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Google SSO Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <form action={handleGoogleLogin}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full mb-6 h-12 border-2 hover:bg-gray-50 transition-all duration-300"
                  disabled={isGoogleLoading || isLocked}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <GoogleIcon className="w-5 h-5 mr-2" />
                  )}
                  Masuk dengan Google
                </Button>
              </form>
            </motion.div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau</span>
              </div>
            </div>

            {/* Login Form */}
            <form action={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <motion.div
                animate={{
                  scale: focusedField === 'email' ? 1.01 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    onChange={handleEmailChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-10 h-12 transition-all duration-300 ${
                      emailError ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'
                    }`}
                    disabled={isLocked}
                    required
                    autoComplete="email"
                  />
                </div>
                <AnimatePresence>
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Input */}
              <motion.div
                animate={{
                  scale: focusedField === 'password' ? 1.01 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="password" className="text-sm text-gray-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-10 h-12 focus:border-orange-500 transition-all duration-300"
                    disabled={isLocked}
                    required
                    autoComplete="current-password"
                    minLength={6}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Login Button */}
              <SubmitButton isLocked={isLocked} />
            </form>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Daftar sekarang
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              Data Anda dilindungi dengan enkripsi dan validasi keamanan
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
