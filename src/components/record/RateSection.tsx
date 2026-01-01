'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Send, CheckCircle, Sparkles, ExternalLink, Loader2 } from 'lucide-react'
import type { Campaign, Business } from '@/types/database'

interface RateSectionProps {
  campaign: Campaign
  business: Business
  recordedVideo: Blob | null
}

export function RateSection({ campaign, business, recordedVideo }: RateSectionProps) {
  const router = useRouter()
  const [name, setName] = useState(campaign.customer_name || '')
  const [productRating, setProductRating] = useState(0)
  const [appRating, setAppRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || productRating === 0 || appRating === 0) {
      alert('Mohon lengkapi semua field')
      return
    }

    if (!recordedVideo) {
      alert('Video tidak ditemukan')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      // 1. Upload video to Cloudinary via API route
      const formData = new FormData()
      formData.append('file', recordedVideo, 'testimonial.webm')
      formData.append('folder', 'vidi-testimonials')

      setUploadProgress(30)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video')
      }

      const uploadData = await uploadResponse.json()
      setUploadProgress(70)

      // 2. Save testimonial to database
      const testimonialResponse = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          video_url: uploadData.url,
          customer_name: name,
          product_rating: productRating,
          app_rating: appRating,
          duration: recordedVideo.size, // Will be calculated properly
        }),
      })

      if (!testimonialResponse.ok) {
        throw new Error('Failed to save testimonial')
      }

      setUploadProgress(100)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      alert('Gagal mengirim testimonial. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (rating: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <label className="text-gray-700 text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="focus:outline-none"
          >
            <Star
              className={`w-10 h-10 ${
                star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              } transition-all`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  )

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Terima Kasih!</h2>
            <p className="text-gray-600 mb-2">Video testimonial Anda telah berhasil dikirim</p>
            <p className="text-gray-500 text-sm">Kami sangat menghargai waktu dan pendapat Anda</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-orange-600"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Video sedang diproses...</span>
          </motion.div>

          {/* Vidi Promotion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl"
          >
            <h4 className="font-medium text-gray-900 mb-2">Powered by Vidi.Official.id</h4>
            <p className="text-sm text-gray-600 mb-4">
              Platform video testimonial untuk UMKM Indonesia
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Pelajari Lebih Lanjut
              <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Satu Langkah Lagi!</h2>
            <p className="text-gray-600 text-sm">
              Bantu kami dengan memberikan rating untuk produk/layanan dan aplikasi kami
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-gray-700 text-sm font-medium">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Product Rating */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <StarRating
                value={productRating}
                onChange={setProductRating}
                label={`Rating Produk/Layanan ${business?.name}`}
              />
              {productRating > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 mt-2">
                  {productRating === 5 && '🎉 Luar biasa! Terima kasih!'}
                  {productRating === 4 && '👍 Bagus sekali!'}
                  {productRating === 3 && '😊 Terima kasih atas masukannya'}
                  {productRating === 2 && '🤔 Kami akan terus berkembang'}
                  {productRating === 1 && '😔 Maaf atas ketidaknyamanannya'}
                </motion.p>
              )}
            </div>

            {/* App Rating */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <StarRating
                value={appRating}
                onChange={setAppRating}
                label="Rating Kemudahan Aplikasi Vidi.Official.id"
              />
              {appRating > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 mt-2">
                  {appRating === 5 && '💯 Senang mendengarnya!'}
                  {appRating === 4 && '✨ Kami senang bisa membantu!'}
                  {appRating === 3 && '👌 Terima kasih atas feedback-nya'}
                  {appRating === 2 && '🔧 Kami akan tingkatkan pengalaman Anda'}
                  {appRating === 1 && '🙏 Terima kasih, kami akan perbaiki'}
                </motion.p>
              )}
            </div>

            {/* Upload Progress */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mengunggah video...</span>
                  <span className="text-orange-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !name || productRating === 0 || appRating === 0}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium ${
                isSubmitting || !name || productRating === 0 || appRating === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Testimonial</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-blue-50 rounded-xl"
          >
            <p className="text-sm text-blue-800 text-center">
              🔒 Video Anda akan diunggah ke sistem kami dengan aman
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
