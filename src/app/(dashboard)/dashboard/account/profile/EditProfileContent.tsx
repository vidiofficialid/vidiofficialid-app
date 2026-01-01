'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User, Upload, Save, Phone, MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface EditProfileContentProps {
  profile: Profile
}

export function EditProfileContent({ profile }: EditProfileContentProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    whatsapp: profile?.whatsapp || '',
    address: profile?.address || '',
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setAvatarFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'vidi_unsigned')
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: fd }
    )
    if (!response.ok) throw new Error('Failed to upload image')
    const data = await response.json()
    return data.secure_url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      let avatarUrl = profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadToCloudinary(avatarFile)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          name: formData.name,
          avatar_url: avatarUrl,
          whatsapp: formData.whatsapp || null,
          address: formData.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
      if (error) {
        alert('Gagal memperbarui profil: ' + error.message)
        return
      }
      alert('Profil berhasil diperbarui!')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Edit Profil</h1>
            <p className="text-gray-600 text-sm">Perbarui informasi profil Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-full object-cover border-4 border-orange-100 shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors">
                <Upload className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </motion.div>
            <p className="text-xs text-gray-500 mt-2">Klik ikon untuk upload foto</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-2">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="6281234567890"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Alamat</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                rows={3}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
