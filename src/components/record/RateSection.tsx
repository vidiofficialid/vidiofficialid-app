'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Send, CheckCircle, Sparkles, ExternalLink, Loader2, Lock } from 'lucide-react'
import type { Campaign, Business } from '@/types/database'

interface RateSectionProps {
  campaign: Campaign
  business: Business
  recordedVideo: Blob | null
}

export function RateSection({ campaign, business, recordedVideo }: RateSectionProps) {
  const [name, setName] = useState(campaign.customer_name || '')
  const [productRating, setProductRating] = useState(0)
  const [appRating, setAppRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const uploadToCloudinary = async (blob: Blob): Promise<{ url: string; duration?: number }> => {
    const cloudName = 'dsv8iy2la'
    const uploadPreset = 'vidi_unsigned'
    
    const formData = new FormData()
    formData.append('file', blob, 'testimonial.webm')
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'vidi-testimonials')
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Gagal upload video')
    
    const data = await response.json()
    return { url: data.secure_url, duration: data.duration }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!name || productRating === 0 || appRating === 0) {
      setErrorMessage('Mohon lengkapi semua field')
      return
    }

    if (!recordedVideo) {
      setErrorMessage('Video tidak ditemukan. Silakan rekam ulang.')
      return
    }

    const fileSizeMB = recordedVideo.size / (1024 * 1024)
    console.log('Video size:', fileSizeMB.toFixed(2), 'MB')
    
    if (fileSizeMB > 50) {
      setErrorMessage('Video terlalu besar. Maksimal 50MB.')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      setUploadProgress(20)
      const uploadResult = await uploadToCloudinary(recordedVideo)
      setUploadProgress(70)

      const testimonialResponse = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          video_url: uploadResult.url,
          customer_name: name,
          product_rating: productRating,
          app_rating: appRating,
          duration: uploadResult.duration || Math.round(recordedVideo.size / 50000),
        }),
      })

      setUploadProgress(90)

      if (!testimonialResponse.ok) {
        const errorData = await testimonialResponse.json()
        console.error('Testimonial API error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to save testimonial')
      }

      setUploadProgress(100)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Gagal mengirim testimonial.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (r: number) => void; label: string }) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
      <label className="text-gray-800 text-sm font-medium block mb-3">{label}</label>
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button key={star} type="button" onClick={() => onChange(star)}
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="focus:outline-none p-1">
            <Star className={`w-10 h-10 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          </motion.button>
        ))}
      </div>
    </div>
  )

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Terima Kasih!</h2>
          <p className="text-gray-600 mb-2">Video testimonial Anda telah berhasil dikirim</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Video sedang diproses...</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="mt-8 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <h4 className="font-semibold text-gray-900 mb-2">Powered by Vidi.Official.id</h4>
            <p className="text-sm text-gray-600 mb-4">Platform video testimonial untuk UMKM Indonesia</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium">
              Daftar Menjadi Pengguna <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Satu Langkah Lagi!</h2>
            <p className="text-gray-600 text-sm">Bantu kami dengan memberikan rating untuk produk/layanan dan aplikasi kami</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-gray-700 text-sm font-medium block mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda" required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
            </div>

            <StarRating value={productRating} onChange={setProductRating} label={`Rating Produk/Layanan ${business?.name || ''}`} />
            <StarRating value={appRating} onChange={setAppRating} label="Rating Kemudahan Aplikasi Vidi.Official.id" />

            {errorMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {errorMessage}
              </motion.div>
            )}

            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mengunggah video...</span>
                  <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                </div>
              </div>
            )}

            <motion.button type="submit" disabled={isSubmitting || !name || productRating === 0 || appRating === 0}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-medium ${
                isSubmitting || !name || productRating === 0 || appRating === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'}`}>
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
                : <><Send className="w-5 h-5" /> Kirim Testimonial</>}
            </motion.button>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">Video Anda akan diunggah dengan aman</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-5 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Powered by Vidi.Official.id</h4>
            <p className="text-sm text-gray-600 mb-4">Platform video testimonial untuk UMKM Indonesia</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
              Daftar Menjadi Pengguna <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
