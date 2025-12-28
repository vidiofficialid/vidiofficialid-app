"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Edit, Trash2, Copy, ExternalLink, Play } from "lucide-react"

interface CampaignActionsProps {
  campaignId: string
  campaignTitle: string
  hasTestimonials: boolean
}

export function CampaignActions({ campaignId, campaignTitle, hasTestimonials }: CampaignActionsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const menuHeight = 250
      
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPosition('top')
      } else {
        setMenuPosition('bottom')
      }
    }
    setIsOpen(!isOpen)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" })
      if (res.ok) {
        router.refresh()
        setShowDeleteConfirm(false)
      } else {
        const data = await res.json()
        alert(data.error || "Gagal menghapus campaign")
      }
    } catch { 
      alert("Terjadi kesalahan") 
    } finally { 
      setIsDeleting(false) 
    }
  }

  const copyRecordingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${campaignId}`)
    alert("Link recording berhasil disalin!")
    setIsOpen(false)
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {isOpen && (
          <div 
            className={`absolute right-0 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[100] ${
              menuPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {hasTestimonials && (
              <button
                onClick={() => {
                  router.push(`/dashboard/campaigns/${campaignId}/recordings`)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Play className="w-4 h-4" /> Lihat Rekaman
              </button>
            )}
            
            <button
              onClick={() => {
                router.push(`/dashboard/campaigns/${campaignId}/edit`)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Edit className="w-4 h-4" /> Edit Campaign
            </button>
            
            <button
              onClick={copyRecordingLink}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Copy className="w-4 h-4" /> Salin Link Recording
            </button>
            
            <button
              onClick={() => {
                window.open(`${window.location.origin}/r/${campaignId}`, "_blank")
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <ExternalLink className="w-4 h-4" /> Buka Link Recording
            </button>
            
            <hr className="my-2" />
            
            <button
              onClick={() => {
                setShowDeleteConfirm(true)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" /> Hapus Campaign
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-black mb-2">Hapus Campaign?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Campaign "<span className="font-medium">{campaignTitle}</span>" akan dihapus permanen beserta semua rekaman.
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
