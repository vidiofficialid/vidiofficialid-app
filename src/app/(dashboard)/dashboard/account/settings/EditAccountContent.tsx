'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Mail, Lock, Eye, EyeOff, Save, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface EditAccountContentProps {
  profile: Profile
  userEmail: string
}

export function EditAccountContent({ profile, userEmail }: EditAccountContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [activeTab, setActiveTab] = useState<'email' | 'password'>('email')

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailForm.newEmail || !emailForm.currentPassword) {
      alert('Mohon isi semua field!')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: emailForm.currentPassword,
      })
      if (signInError) {
        alert('Password saat ini salah!')
        return
      }
      // Update email
      const { error } = await supabase.auth.updateUser({ email: emailForm.newEmail })
      if (error) {
        alert('Gagal mengubah email: ' + error.message)
        return
      }
      alert('Email konfirmasi telah dikirim ke alamat email baru Anda. Silakan cek inbox.')
      setEmailForm({ newEmail: '', currentPassword: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Mohon isi semua field!')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru tidak cocok!')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password minimal 8 karakter!')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: passwordForm.currentPassword,
      })
      if (signInError) {
        alert('Password saat ini salah!')
        return
      }
      // Update password
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
      if (error) {
        alert('Gagal mengubah password: ' + error.message)
        return
      }
      alert('Password berhasil diubah!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Edit Account</h1>
            <p className="text-gray-600 text-sm">Ubah email atau password akun Anda</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Ubah Email
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'password' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Ubah Password
          </button>
        </div>

        {/* Current Email Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">Email saat ini:</p>
          <p className="font-medium text-gray-800">{userEmail}</p>
        </div>

        {activeTab === 'email' ? (
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Baru</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  placeholder="email.baru@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password Saat Ini</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => togglePassword('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? 'Menyimpan...' : 'Ubah Email'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password Saat Ini</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => togglePassword('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => togglePassword('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Masukkan ulang password baru"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => togglePassword('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? 'Menyimpan...' : 'Ubah Password'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
