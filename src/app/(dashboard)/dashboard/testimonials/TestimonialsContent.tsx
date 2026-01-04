'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MessageSquare,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  AlertTriangle,
  X,
  Info,
  RefreshCw,
} from 'lucide-react'
import type { Testimonial, Campaign, Business } from '@/types/database'

interface TestimonialsContentProps {
  testimonials: Testimonial[]
  campaigns: Campaign[]
  businesses: Business[]
}

export function TestimonialsContent({
  testimonials: initialTestimonials,
  campaigns,
  businesses,
}: TestimonialsContentProps) {
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only showing date-dependent content after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getCampaign = (campaignId: string) => campaigns.find(c => c.id === campaignId)
  const getBusiness = (businessId: string) => businesses.find(b => b.id === businessId)

  const getDaysRemaining = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const getDaysSinceCreated = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diff = now.getTime() - created.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const handleApprove = async (testimonialId: string) => {
    setIsProcessing(testimonialId)
    try {
      const response = await fetch('/api/testimonials/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, action: 'approve' }),
      })

      const data = await response.json()

      if (data.success) {
        setTestimonials(prev =>
          prev.map(t =>
            t.id === testimonialId
              ? { ...t, status: 'APPROVED' as const, approved_at: new Date().toISOString(), expires_at: data.expires_at }
              : t
          )
        )
        alert('Testimonial berhasil di-approve! Video dapat didownload selama 15 hari.')
      } else {
        alert('Gagal meng-approve testimonial: ' + data.error)
      }
    } catch (error) {
      console.error('Error approving:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (testimonialId: string) => {
    setIsProcessing(testimonialId)
    try {
      const response = await fetch('/api/testimonials/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, action: 'reject' }),
      })

      const data = await response.json()

      if (data.success) {
        setTestimonials(prev =>
          prev.map(t =>
            t.id === testimonialId
              ? { ...t, status: 'REJECTED' as const, rejected_at: new Date().toISOString(), expires_at: data.delete_at }
              : t
          )
        )
        setShowRejectModal(null)
      } else {
        alert('Gagal me-reject testimonial: ' + data.error)
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDownload = async (videoUrl: string, fileName: string) => {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `testimonial-${fileName}.webm`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading:', error)
      alert('Gagal mengunduh video')
    }
  }

  const getStatusBadge = (testimonial: Testimonial) => {
    const daysRemaining = isMounted ? getDaysRemaining(testimonial.expires_at) : null
    const daysSinceCreated = isMounted ? getDaysSinceCreated(testimonial.created_at) : 0
    const pendingDaysLeft = 10 - daysSinceCreated

    switch (testimonial.status) {
      case 'APPROVED':
        return (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Approved
            </span>
            {isMounted && daysRemaining !== null && daysRemaining > 0 && (
              <span className="text-xs text-green-600">
                {daysRemaining} hari tersisa untuk download
              </span>
            )}
          </div>
        )
      case 'REJECTED':
        return (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              <XCircle className="w-3 h-3" />
              Rejected
            </span>
            {isMounted && daysRemaining !== null && daysRemaining > 0 && (
              <span className="text-xs text-red-600">
                Dihapus dalam {daysRemaining} hari
              </span>
            )}
          </div>
        )
      case 'DELETED':
        return (
          <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            <Trash2 className="w-3 h-3" />
            Deleted
          </span>
        )
      default:
        return (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              Pending
            </span>
            {isMounted && (pendingDaysLeft > 0 ? (
              <span className="text-xs text-yellow-600">
                {pendingDaysLeft} hari untuk review
              </span>
            ) : (
              <span className="text-xs text-red-600">
                Akan dihapus otomatis
              </span>
            ))}
          </div>
        )
    }
  }

  const visibleTestimonials = testimonials.filter(t => t.status !== 'DELETED')
  const pendingCount = testimonials.filter(t => t.status === 'PENDING').length
  const approvedCount = testimonials.filter(t => t.status === 'APPROVED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg bg-white shadow"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold">Testimonial</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInfoModal(true)}
          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
        >
          <Info className="w-5 h-5" />
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{visibleTestimonials.length}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-xs text-gray-600">Approved</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Kebijakan Penyimpanan Video</p>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Video <strong>Pending</strong>: Otomatis dihapus setelah 10 hari jika tidak di-review</li>
              <li>• Video <strong>Approved</strong>: Dapat didownload selama 15 hari sejak approval</li>
              <li>• Video <strong>Rejected</strong>: Dihapus dalam 3 hari</li>
            </ul>
            <p className="text-xs mt-2 text-blue-600">
              Kebijakan ini membantu menjaga layanan tetap optimal untuk semua pengguna VidiOfficialID.
            </p>
          </div>
        </div>
      </motion.div>

      {visibleTestimonials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Testimonial</h2>
          <p className="text-gray-500 mb-6">Buat campaign dan undang pelanggan untuk memberikan testimonial</p>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {visibleTestimonials.map((testimonial, index) => {
            const campaign = getCampaign(testimonial.campaign_id)
            const business = campaign ? getBusiness(campaign.business_id) : null
            const deviceInfo = testimonial.device_info ? JSON.parse(testimonial.device_info) : null
            const isPending = testimonial.status === 'PENDING'
            const isApproved = testimonial.status === 'APPROVED'
            const daysRemaining = getDaysRemaining(testimonial.expires_at)

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
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => testimonial.video_url && setSelectedVideo(testimonial.video_url)}
                      className="relative w-24 h-32 bg-gray-900 rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                    >
                      {testimonial.video_url ? (
                        <>
                          <video src={testimonial.video_url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-gray-800 ml-1" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trash2 className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {deviceInfo?.customer_name || campaign?.customer_name || 'Anonymous'}
                          </h3>
                          <p className="text-sm text-gray-500">{campaign?.title} • {business?.name}</p>
                        </div>
                        {getStatusBadge(testimonial)}
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
                        {isMounted ? new Date(testimonial.recorded_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        }) : '...'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {isPending && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(testimonial.id)}
                              disabled={isProcessing === testimonial.id}
                              className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                            >
                              {isProcessing === testimonial.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowRejectModal(testimonial.id)}
                              disabled={isProcessing === testimonial.id}
                              className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </motion.button>
                          </>
                        )}
                        {isApproved && testimonial.video_url && daysRemaining && daysRemaining > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload(testimonial.video_url, testimonial.id.slice(0, 8))}
                            className="flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <AnimatePresence>
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
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full"
            >
              <video src={selectedVideo} controls autoPlay className="w-full rounded-2xl" style={{ maxHeight: '80vh' }} />
              <button onClick={() => setSelectedVideo(null)} className="absolute -top-12 right-0 text-white text-sm flex items-center gap-1">
                <X className="w-4 h-4" /> Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRejectModal(null)}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Reject Testimonial?</h3>
                  <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Perhatian:</strong> Video testimonial akan dihapus dari server dalam waktu <strong>3 hari</strong>.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Anda dapat mengundang ulang konsumen untuk memberikan testimonial baru melalui campaign yang sudah dibuat.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReject(showRejectModal)}
                  disabled={isProcessing === showRejectModal}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing === showRejectModal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Ya, Reject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfoModal(false)}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Kebijakan Penyimpanan</h3>
                <button onClick={() => setShowInfoModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Status Pending</h4>
                  </div>
                  <p className="text-sm text-yellow-700">Video yang belum di-review akan otomatis dihapus setelah <strong>10 hari</strong> sejak diunggah konsumen.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Status Approved</h4>
                  </div>
                  <p className="text-sm text-green-700">Video yang di-approve dapat didownload selama <strong>15 hari</strong>. Setelah itu, video akan dihapus dari server.</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">Status Rejected</h4>
                  </div>
                  <p className="text-sm text-red-700">Video yang di-reject akan dihapus dalam <strong>3 hari</strong>. Anda dapat mengundang ulang konsumen untuk testimonial baru.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Mengapa Ada Kebijakan Ini?</h4>
                  </div>
                  <p className="text-sm text-blue-700">Kebijakan penghapusan otomatis membantu menjaga layanan VidiOfficialID tetap berfungsi optimal dan operasional untuk mendukung semua pengguna.</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInfoModal(false)}
                className="w-full mt-4 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium"
              >
                Mengerti
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
