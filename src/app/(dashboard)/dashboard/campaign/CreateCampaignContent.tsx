'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Megaphone,
  Upload,
  Save,
  ChevronDown,
  Mail,
  Phone,
  Send,
  ImageIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business, Campaign, InviteMethod } from '@/types/database'

interface CreateCampaignContentProps {
  businesses: Business[]
  existingCampaigns: Campaign[]
}

export function CreateCampaignContent({
  businesses,
  existingCampaigns,
}: CreateCampaignContentProps) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>(existingCampaigns)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    brandName: '',
    testimonialScript: '',
    gestureDescription: '',
    customerName: '',
    invitationMethod: 'EMAIL' as InviteMethod,
    customerEmail: '',
    customerWhatsapp: '',
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        setThumbnailFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'vidi-campaign-thumbnails')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload image')
    }

    const data = await response.json()
    return data.url
  }

  const handleSendInvitation = async () => {
    const contact =
      formData.invitationMethod === 'EMAIL'
        ? formData.customerEmail
        : formData.customerWhatsapp

    if (!contact) {
      alert('Masukkan kontak pemberi testimonial terlebih dahulu!')
      return
    }

    if (!formData.customerName) {
      alert('Masukkan nama pemberi testimonial!')
      return
    }

    setIsSendingInvite(true)

    try {
      // Here you would integrate with Resend API for email or WhatsApp API
      if (formData.invitationMethod === 'EMAIL') {
        // Send email invitation
        alert(`Undangan akan dikirim ke email: ${formData.customerEmail}`)
      } else {
        // Open WhatsApp with pre-filled message
        const message = encodeURIComponent(
          `Halo ${formData.customerName},\n\nAnda diundang untuk memberikan video testimoni untuk ${formData.brandName || 'bisnis kami'}.\n\nScript: ${formData.testimonialScript}\n\nPetunjuk gesture: ${formData.gestureDescription}\n\nTerima kasih!`
        )
        const waNumber = formData.customerWhatsapp.replace(/\D/g, '')
        window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Gagal mengirim undangan')
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.businessId) {
      alert('Silakan pilih bisnis terlebih dahulu!')
      return
    }

    if (!formData.name || !formData.customerName) {
      alert('Mohon lengkapi semua field yang diperlukan!')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      let thumbnailUrl = ''
      if (thumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(thumbnailFile)
      }

      const selectedBusiness = businesses.find((b) => b.id === formData.businessId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('campaigns')
        .insert({
          business_id: formData.businessId,
          title: formData.name,
          brand_name: formData.brandName || selectedBusiness?.name || '',
          product_image: thumbnailUrl || null,
          testimonial_script: formData.testimonialScript || null,
          gesture_guide: formData.gestureDescription || null,
          customer_name: formData.customerName,
          customer_email:
            formData.invitationMethod === 'EMAIL' ? formData.customerEmail : null,
          customer_whatsapp:
            formData.invitationMethod === 'WHATSAPP'
              ? formData.customerWhatsapp
              : null,
          invite_method: formData.invitationMethod,
          status: 'DRAFT',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating campaign:', error)
        alert('Gagal membuat campaign: ' + error.message)
        return
      }

      alert('Campaign berhasil dibuat!')
      setCampaigns([data as Campaign, ...campaigns])
      router.refresh()

      // Reset form
      setFormData({
        businessId: '',
        name: '',
        brandName: '',
        testimonialScript: '',
        gestureDescription: '',
        customerName: '',
        invitationMethod: 'EMAIL',
        customerEmail: '',
        customerWhatsapp: '',
      })
      setPreviewImage('')
      setThumbnailFile(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat membuat campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Buat Campaign Baru</h1>
            <p className="text-gray-600 text-sm">
              Buat campaign untuk mengumpulkan testimonial
            </p>
          </div>
        </div>

        {businesses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center"
          >
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium mb-4">
              Anda belum memiliki bisnis. Silakan buat bisnis terlebih dahulu
              sebelum membuat campaign.
            </p>
            <Link href="/dashboard/business">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Buat Bisnis Sekarang
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Select Business */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pilih Bisnis *
              </label>
              <div className="relative">
                <select
                  value={formData.businessId}
                  onChange={(e) =>
                    setFormData({ ...formData, businessId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Pilih Bisnis --</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name} ({business.product_category?.toLowerCase()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Campaign *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Promo Akhir Tahun 2026"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Brand
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) =>
                  setFormData({ ...formData, brandName: e.target.value })
                }
                placeholder="Nama brand untuk ditampilkan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Thumbnail Poster Campaign
              </label>
              <div className="flex items-start gap-4">
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Thumbnail preview"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors inline-flex"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Thumbnail
                    </motion.div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload ke Cloudinary CDN
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Script */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Script Testimoni yang Diharapkan
              </label>
              <textarea
                value={formData.testimonialScript}
                onChange={(e) =>
                  setFormData({ ...formData, testimonialScript: e.target.value })
                }
                placeholder="Contoh: Ceritakan pengalaman Anda menggunakan produk/jasa kami..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Gesture Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Penjelasan Gesture Penyampaian
              </label>
              <textarea
                value={formData.gestureDescription}
                onChange={(e) =>
                  setFormData({ ...formData, gestureDescription: e.target.value })
                }
                placeholder="Contoh: Senyum, tunjukkan produk, gunakan bahasa yang ramah..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Invitee Information */}
            <div className="border-t pt-5">
              <h2 className="text-lg font-semibold mb-4">
                Informasi Pemberi Testimoni
              </h2>

              {/* Invitee Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Nama Pemberi Testimoni *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Nama lengkap pemberi testimoni"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Invitation Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Metode Pengiriman Undangan *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.invitationMethod === 'EMAIL'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="invitationMethod"
                      value="EMAIL"
                      checked={formData.invitationMethod === 'EMAIL'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invitationMethod: e.target.value as InviteMethod,
                        })
                      }
                      className="hidden"
                    />
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </motion.label>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.invitationMethod === 'WHATSAPP'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="invitationMethod"
                      value="WHATSAPP"
                      checked={formData.invitationMethod === 'WHATSAPP'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invitationMethod: e.target.value as InviteMethod,
                        })
                      }
                      className="hidden"
                    />
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </motion.label>
                </div>
              </div>

              {/* Contact Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {formData.invitationMethod === 'EMAIL'
                    ? 'Email Pemberi Testimoni'
                    : 'Nomor WhatsApp Pemberi Testimoni'}{' '}
                  *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.invitationMethod === 'EMAIL' ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                  </div>
                  <input
                    type={formData.invitationMethod === 'EMAIL' ? 'email' : 'tel'}
                    value={
                      formData.invitationMethod === 'EMAIL'
                        ? formData.customerEmail
                        : formData.customerWhatsapp
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [formData.invitationMethod === 'EMAIL'
                          ? 'customerEmail'
                          : 'customerWhatsapp']: e.target.value,
                      })
                    }
                    placeholder={
                      formData.invitationMethod === 'EMAIL'
                        ? 'email@example.com'
                        : '6281234567890'
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Send Invitation Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSendInvitation}
                disabled={isSendingInvite}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Link Undangan
                  </>
                )}
              </motion.button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Campaign
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>

      {/* Existing Campaigns with Invitation Links */}
      {campaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">Campaign & Link Undangan</h2>
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const business = businesses.find(
                (b) => b.id === campaign.business_id
              )
              const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://vidi.official.id'}/record/${campaign.id}`
              
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  {/* Campaign Info */}
                  <div className="flex items-start gap-3 mb-4">
                    {campaign.product_image ? (
                      <Image
                        src={campaign.product_image}
                        alt={campaign.title}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <p className="text-sm text-gray-600">{business?.name}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            campaign.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-700'
                              : campaign.status === 'INVITED'
                              ? 'bg-blue-100 text-blue-700'
                              : campaign.status === 'RECORDED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Invitee Info & Link */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-medium text-sm">
                            {campaign.customer_name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{campaign.customer_name}</p>
                          <p className="text-xs text-gray-500">
                            {campaign.invite_method === 'EMAIL' 
                              ? campaign.customer_email 
                              : campaign.customer_whatsapp}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        campaign.invite_method === 'EMAIL'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {campaign.invite_method === 'EMAIL' ? 'Email' : 'WhatsApp'}
                      </span>
                    </div>

                    {/* Invitation Link */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink)
                          alert('Link berhasil disalin!')
                        }}
                        className="px-3 py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Salin
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (campaign.invite_method === 'WHATSAPP' && campaign.customer_whatsapp) {
                            const message = encodeURIComponent(
                              `Halo ${campaign.customer_name},\n\nAnda diundang untuk memberikan video testimoni.\n\nSilakan klik link berikut:\n${inviteLink}\n\nTerima kasih!`
                            )
                            const waNumber = campaign.customer_whatsapp.replace(/\D/g, '')
                            window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank')
                          } else {
                            window.open(inviteLink, '_blank')
                          }
                        }}
                        className="px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Kirim
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
