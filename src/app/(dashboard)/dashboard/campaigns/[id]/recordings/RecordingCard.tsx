"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Download, Trash2, Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface Testimonial {
  id: string
  videoUrl: string
  status: string
  recordedAt: string
  cloudinaryId: string | null
}

interface RecordingCardProps {
  testimonial: Testimonial
  daysRemaining: number
}

export function RecordingCard({ testimonial, daysRemaining }: RecordingCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(testimonial.status)

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(testimonial.videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `testimonial-${testimonial.id}.webm`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert("Gagal mendownload video")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleStatusChange = async (newStatus: "APPROVED" | "REJECTED" | "PENDING") => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        setCurrentStatus(newStatus)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Gagal mengubah status")
      }
    } catch {
      alert("Terjadi kesalahan")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        router.refresh()
        setShowDeleteConfirm(false)
      } else {
        const data = await res.json()
        alert(data.error || "Gagal menghapus rekaman")
      }
    } catch {
      alert("Terjadi kesalahan")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'APPROVED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Disetujui
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Menunggu Review
          </span>
        )
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Video */}
          <div className="lg:w-80 bg-black">
            <video
              src={testimonial.videoUrl}
              controls
              className="w-full h-48 lg:h-full object-contain"
              preload="metadata"
            />
          </div>

          {/* Info */}
          <div className="flex-1 p-4 lg:p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge()}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(testimonial.recordedAt)}
                  </span>
                </div>
              </div>

              {/* Days remaining badge */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                daysRemaining <= 3 
                  ? 'bg-red-100 text-red-700' 
                  : daysRemaining <= 7 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <Clock className="w-3 h-3 inline mr-1" />
                {daysRemaining} hari lagi
              </div>
            </div>

            {/* Warning if less than 3 days */}
            {daysRemaining <= 3 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-red-700">
                  ⚠️ Rekaman akan dihapus dalam {daysRemaining} hari. Segera download!
                </p>
              </div>
            )}

            {/* Approval Actions */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">Review Testimonial:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange("APPROVED")}
                  disabled={isUpdating || currentStatus === "APPROVED"}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStatus === "APPROVED"
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  } disabled:opacity-50`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={isUpdating || currentStatus === "REJECTED"}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStatus === "REJECTED"
                      ? "bg-red-500 text-white cursor-default"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  } disabled:opacity-50`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
                {currentStatus !== "PENDING" && (
                  <button
                    onClick={() => handleStatusChange("PENDING")}
                    disabled={isUpdating}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    title="Reset ke Pending"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus rekaman"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-black mb-2">Hapus Rekaman?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Rekaman ini akan dihapus permanen dari server dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
