'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MessageSquare,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Video,
} from 'lucide-react'
import type { Testimonial, Campaign, Business } from '@/types/database'

interface TestimonialsContentProps {
  testimonials: Testimonial[]
  campaigns: Campaign[]
  businesses: Business[]
}

export function TestimonialsContent({
  testimonials,
  campaigns,
  businesses,
}: TestimonialsContentProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const getCampaign = (campaignId: string) => campaigns.find(c => c.id === campaignId)
  const getBusiness = (businessId: string) => businesses.find(b => b.id === businessId)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold">Testimonial</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{testimonials.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {testimonials.filter(t => t.status === 'APPROVED').length}
            </p>
            <p className="text-xs text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {testimonials.filter(t => t.status === 'PENDING').length}
            </p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        </motion.div>

        {testimonials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Testimonial
            </h2>
            <p className="text-gray-500 mb-6">
              Buat campaign dan undang pelanggan untuk memberikan testimonial
            </p>
            <Link href="/dashboard/campaign">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Buat Campaign
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {testimonials.map((testimonial, index) => {
              const campaign = getCampaign(testimonial.campaign_id)
              const business = campaign ? getBusiness(campaign.business_id) : null
              const deviceInfo = testimonial.device_info ? JSON.parse(testimonial.device_info) : null

              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Video Thumbnail */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedVideo(testimonial.video_url)}
                        className="relative w-24 h-32 bg-gray-900 rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                      >
                        <video
                          src={testimonial.video_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-gray-800 ml-1" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {deviceInfo?.customer_name || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {campaign?.title} • {business?.name}
                            </p>
                          </div>
                          {getStatusBadge(testimonial.status)}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {deviceInfo?.product_rating && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              Produk: {'⭐'.repeat(deviceInfo.product_rating)}
                            </span>
                          )}
                          {testimonial.duration && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {Math.round(testimonial.duration)}s
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(testimonial.recorded_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedVideo(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full"
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-2xl"
              style={{ maxHeight: '80vh' }}
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white text-sm"
            >
              Tutup ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
