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

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      // 1. Upload video to Cloudinary via API route
      const formData = new FormData()
      formData.append('file', recordedVideo, 'testimonial.webm')
      formData.append('folder', 'vidi-testimonials')

      setUploadProgress(20)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(60)

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload video')
      }

      const uploadData = await uploadResponse.json()
      setUploadProgress(80)

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
          duration: uploadData.duration || Math.round(recordedVideo.size / 50000),
        }),
      })

      if (!testimonialResponse.ok) {
        const errorData = await testimonialResponse.json()
        throw new Error(errorData.error || 'Failed to save testimonial')
      }

      setUploadProgress(100)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Gagal mengirim testimonial. Silakan coba lagi.')
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
      <label className="text-gray-800 text-sm font-medium block mb-3">{label}</label>
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="focus:outline-none p-1"
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
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
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
            className="mt-6 flex items-center justify-center gap-2 text-blue-600"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Video sedang diproses...</span>
          </motion.div>

          {/* Vidi Promotion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Powered by Vidi.Official.id</h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Anda telah menggunakan layanan digital{' '}
              <span className="font-semibold text-indigo-600">Vidi.Official.id</span> yang bertujuan 
              memberikan kemudahan bagi usaha kecil di Indonesia untuk mendapatkan video testimonial 
              dari konsumennya.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Daftar Menjadi Pengguna
              <ExternalLink className="w-4 h-4" />
            </Link>
            <p className="text-xs text-gray-500 mt-3">
              Dapatkan video testimonial dari pelanggan Anda dengan mudah
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white rounded-3xl shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Satu Langkah Lagi!</h2>
            <p className="text-gray-600 text-sm">
              Bantu kami dengan memberikan rating untuk produk/layanan dan aplikasi kami
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="text-gray-700 text-sm font-medium block mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Product Rating */}
            <StarRating
              value={productRating}
              onChange={setProductRating}
              label={`Rating Produk/Layanan ${business?.name || ''}`}
            />

            {/* App Rating */}
            <StarRating
              value={appRating}
              onChange={setAppRating}
              label="Rating Kemudahan Aplikasi Vidi.Official.id"
            />

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Upload Progress */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mengunggah video...</span>
                  <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
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
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
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

          {/* Security Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 p-4 bg-blue-50 rounded-xl flex items-center gap-3"
          >
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Video Anda akan dikompresi dan diunggah ke sistem kami dengan aman
            </p>
          </motion.div>

          {/* Vidi Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
          >
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Powered by Vidi.Official.id</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Anda telah menggunakan layanan digital{' '}
                <span className="font-semibold text-indigo-600">Vidi.Official.id</span> yang bertujuan 
                memberikan kemudahan bagi usaha kecil di Indonesia untuk mendapatkan video testimonial 
                dari konsumennya.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Daftar Menjadi Pengguna
                <ExternalLink className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-500 mt-3">
                Dapatkan video testimonial dari pelanggan Anda dengan mudah
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
