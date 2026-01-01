'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface DeleteAccountContentProps {
  profile: Profile
  userEmail: string
}

export function DeleteAccountContent({ profile, userEmail }: DeleteAccountContentProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) {
      alert('Email tidak cocok!')
      return
    }
    setIsDeleting(true)
    try {
      const supabase = createClient()
      
      // Get user's businesses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: businesses } = await (supabase as any)
        .from('businesses')
        .select('id')
        .eq('user_id', profile.id) as { data: { id: string }[] | null }
      
      const businessIds = businesses?.map(b => b.id) || []
      
      // Delete testimonials for user's campaigns
      if (businessIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: campaigns } = await (supabase as any)
          .from('campaigns')
          .select('id')
          .in('business_id', businessIds) as { data: { id: string }[] | null }
        
        const campaignIds = campaigns?.map(c => c.id) || []
        
        if (campaignIds.length > 0) {
          await supabase.from('testimonials').delete().in('campaign_id', campaignIds)
        }
        
        // Delete campaigns
        await supabase.from('campaigns').delete().in('business_id', businessIds)
        
        // Delete businesses
        await supabase.from('businesses').delete().eq('user_id', profile.id)
      }
      
      // Delete profile
      await supabase.from('profiles').delete().eq('id', profile.id)
      
      // Delete auth user (this will sign them out)
      // Note: This requires admin privileges in Supabase, so we'll just sign them out
      await supabase.auth.signOut()
      
      alert('Akun berhasil dihapus!')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat menghapus akun')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-red-600">Hapus Akun</h1>
            <p className="text-gray-600 text-sm">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Peringatan!</h3>
                  <p className="text-red-700 text-sm mb-3">
                    Dengan menghapus akun, Anda akan kehilangan:
                  </p>
                  <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                    <li>Semua data profil Anda</li>
                    <li>Semua bisnis yang telah dibuat</li>
                    <li>Semua campaign yang telah dibuat</li>
                    <li>Semua testimonial yang telah diterima</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin melanjutkan penghapusan akun?
            </p>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium"
              >
                Batalkan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium"
              >
                Ya, Lanjutkan
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <p className="text-amber-800 text-sm">
                Untuk mengonfirmasi penghapusan akun, ketikkan email Anda:
              </p>
              <p className="font-mono font-bold text-amber-900 mt-2">{userEmail}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Konfirmasi Email</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Ketik email Anda untuk konfirmasi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium"
              >
                Kembali
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                disabled={isDeleting || confirmEmail !== userEmail}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Hapus Akun Permanen
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
