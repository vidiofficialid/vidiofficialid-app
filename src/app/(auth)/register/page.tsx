'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'
import { GoogleIcon } from '@/components/auth/GoogleIcon'

function SubmitButton({ hasErrors }: { hasErrors: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <motion.div
      whileHover={{ scale: pending || hasErrors ? 1 : 1.02 }}
      whileTap={{ scale: pending || hasErrors ? 1 : 0.98 }}
      className="pt-2"
    >
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        disabled={pending || hasErrors}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Membuat akun...
          </>
        ) : (
          'Daftar Sekarang'
        )}
      </Button>
    </motion.div>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (pwd: string): { isValid: boolean; message: string } => {
    if (pwd.length < 8) {
      return { isValid: false, message: 'Password minimal 8 karakter' }
    }
    if (!/[A-Z]/.test(pwd)) {
      return { isValid: false, message: 'Password harus mengandung huruf besar' }
    }
    if (!/[a-z]/.test(pwd)) {
      return { isValid: false, message: 'Password harus mengandung huruf kecil' }
    }
    if (!/[0-9]/.test(pwd)) {
      return { isValid: false, message: 'Password harus mengandung angka' }
    }
    return { isValid: true, message: '' }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value.length > 0 && value.length < 3) {
      setErrors((prev) => ({ ...prev, name: 'Nama lengkap minimal 3 karakter' }))
    } else {
      setErrors((prev) => ({ ...prev, name: '' }))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: 'Format email tidak valid' }))
    } else {
      setErrors((prev) => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    const validation = validatePassword(value)
    if (value && !validation.isValid) {
      setErrors((prev) => ({ ...prev, password: validation.message }))
    } else {
      setErrors((prev) => ({ ...prev, password: '' }))
    }

    if (confirmPassword && value !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Password tidak cocok' }))
    } else if (confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    
    if (value && value !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Password tidak cocok' }))
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }))
    }
  }

  async function handleSubmit(formData: FormData) {
    setServerError(null)
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const pwd = formData.get('password') as string
    const confirmPwd = formData.get('confirmPassword') as string

    // Validate all fields
    const newErrors = {
      name: name.length < 3 ? 'Nama lengkap minimal 3 karakter' : '',
      email: !validateEmail(email) ? 'Format email tidak valid' : '',
      password: validatePassword(pwd).isValid ? '' : validatePassword(pwd).message,
      confirmPassword: pwd !== confirmPwd ? 'Password tidak cocok' : '',
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error !== '')) {
      return
    }

    const result = await signUp(formData)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  async function handleGoogleRegister() {
    setIsGoogleLoading(true)
    setServerError(null)
    const result = await signInWithGoogle()
    if (result?.error) {
      setServerError(result.error)
    }
    setIsGoogleLoading(false)
  }

  const hasErrors = Object.values(errors).some((error) => error !== '')

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
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Kembali ke Login</span>
            </Link>
          </motion.div>

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
              Buat Akun Baru
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-600 max-w-sm mx-auto"
            >
              Bergabunglah dengan ribuan UMKM Indonesia yang sudah menggunakan VidiOfficialID
            </motion.p>
          </div>

          {/* Register Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6"
              >
                {serverError}
              </motion.div>
            )}

            {/* Google SSO Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <form action={handleGoogleRegister}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full mb-6 h-12 border-2 hover:bg-gray-50 transition-all duration-300"
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <GoogleIcon className="w-5 h-5 mr-2" />
                  )}
                  Daftar dengan Google
                </Button>
              </form>
            </motion.div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau daftar manual</span>
              </div>
            </div>

            {/* Register Form */}
            <form action={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <motion.div
                animate={{
                  scale: focusedField === 'name' ? 1.01 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="name" className="text-sm text-gray-700 mb-2 block">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    onChange={handleNameChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-10 h-12 transition-all duration-300 ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'
                    }`}
                    required
                    autoComplete="name"
                  />
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Input */}
              <motion.div
                animate={{
                  scale: focusedField === 'email' ? 1.01 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                  Email Pendaftar
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
                      errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.email}
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
                <Label htmlFor="password" className="text-sm text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-10 pr-10 h-12 transition-all duration-300 ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'
                    }`}
                    required
                    autoComplete="new-password"
                    minLength={8}
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
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-gray-500 mt-1">
                  Harus mengandung huruf besar, huruf kecil, dan angka
                </p>
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                animate={{
                  scale: focusedField === 'confirmPassword' ? 1.01 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700 mb-2 block">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Masukkan ulang password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-10 pr-10 h-12 transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Register Button */}
              <SubmitButton hasErrors={hasErrors} />
            </form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Masuk di sini
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
              Dengan mendaftar, Anda menyetujui{' '}
              <Link href="/terms-of-service" className="text-orange-600 hover:underline">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link href="/privacy-policy" className="text-orange-600 hover:underline">
                Kebijakan Privasi
              </Link>{' '}
              kami
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
