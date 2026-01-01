'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageSquare, Check, X, Play, Mail, Loader2, Video, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business, Campaign, Testimonial, TestimonialStatus } from '@/types/database'

interface TestimonialWithCampaign extends Testimonial {
  campaign?: Campaign & { business?: Business }
}

interface TestimonialsContentProps {
  testimonials: TestimonialWithCampaign[]
  businesses: Business[]
}

export function TestimonialsContent({ testimonials: initialTestimonials, businesses }: TestimonialsContentProps) {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApproval = async (id: string, status: TestimonialStatus) => {
    setProcessingId(id)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('testimonials')
        .update({ status })
        .eq('id', id)

      if (error) {
        alert('Gagal memperbarui status: ' + error.message)
        return
      }

      // Update local state
      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, status } : t
      ))

      // Send email notification (integration with Resend)
      const testimonial = testimonials.find(t => t.id === id)
      if (testimonial?.campaign?.customer_email) {
        alert(`Email notifikasi akan dikirim ke ${testimonial.campaign.customer_email}`)
        // Here you would integrate with Resend API
      }

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: TestimonialStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: TestimonialStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu'
      case 'APPROVED':
        return 'Disetujui'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Daftar Testimonial</h1>
            <p className="text-gray-600 text-sm">Kelola testimonial dari pelanggan Anda</p>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada testimonial</h3>
            <p className="text-gray-500 text-sm">Testimonial dari pelanggan akan muncul di sini</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div 
                    className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                    onClick={() => setSelectedVideo(testimonial.video_url)}
                  >
                    {testimonial.thumbnail_url ? (
                      <Image
                        src={testimonial.thumbnail_url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {testimonial.campaign?.customer_name || 'Pelanggan'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {testimonial.campaign?.business?.name || 'Bisnis'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(testimonial.status)}`}>
                        {getStatusLabel(testimonial.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(testimonial.recorded_at)}
                      </span>
                      {testimonial.duration && (
                        <span>{Math.round(testimonial.duration)}s</span>
                      )}
                    </div>

                    {/* Actions */}
                    {testimonial.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproval(testimonial.id, 'APPROVED')}
                          disabled={processingId === testimonial.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                        >
                          {processingId === testimonial.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Setujui
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproval(testimonial.id, 'REJECTED')}
                          disabled={processingId === testimonial.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Tolak
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-black rounded-2xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full aspect-video"
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
