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
  ArrowLeft,
  Copy,
  ExternalLink,
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
    invitationMethod: 'WHATSAPP' as InviteMethod,
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
    formData.append('upload_preset', 'vidi_unsigned')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleSendInvitation = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    const recordUrl = `${window.location.origin}/record/${campaignId}`
    const message = encodeURIComponent(
      `Halo ${campaign.customer_name},\n\nAnda diundang untuk memberikan video testimoni untuk ${campaign.brand_name}.\n\nKlik link berikut untuk mulai:\n${recordUrl}\n\nTerima kasih!`
    )
    
    if (campaign.customer_whatsapp) {
      const waNumber = campaign.customer_whatsapp.replace(/\D/g, '')
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank')
    }
  }

  const copyRecordLink = (campaignId: string) => {
    const url = `${window.location.origin}/record/${campaignId}`
    navigator.clipboard.writeText(url)
    alert('Link berhasil disalin!')
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
        invitationMethod: 'WHATSAPP',
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
          <h1 className="text-xl font-bold">Kelola Campaign</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
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
              <h2 className="text-xl font-bold">Buat Campaign Baru</h2>
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
                Anda belum memiliki bisnis. Buat bisnis terlebih dahulu.
              </p>
              <Link href="/dashboard/business">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Buat Bisnis
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Business */}
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Bisnis *</label>
                <div className="relative">
                  <select
                    value={formData.businessId}
                    onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                    required
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Bisnis --</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Campaign Name & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Campaign *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Promo Akhir Tahun"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Brand</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Brand untuk ditampilkan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {previewImage ? (
                      <Image src={previewImage} alt="Preview" width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </motion.div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Script & Gesture */}
              <div>
                <label className="block text-sm font-medium mb-2">Script Testimoni</label>
                <textarea
                  value={formData.testimonialScript}
                  onChange={(e) => setFormData({ ...formData, testimonialScript: e.target.value })}
                  placeholder="Ceritakan pengalaman menggunakan produk/jasa kami..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Petunjuk Gesture</label>
                <textarea
                  value={formData.gestureDescription}
                  onChange={(e) => setFormData({ ...formData, gestureDescription: e.target.value })}
                  placeholder="Senyum, tunjukkan produk, gunakan bahasa ramah..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Customer Info */}
              <div className="border-t pt-5">
                <h3 className="text-lg font-semibold mb-4">Info Pemberi Testimoni</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nama *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Nama lengkap"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Invitation Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Metode Undangan</label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                        formData.invitationMethod === 'WHATSAPP'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value="WHATSAPP"
                        checked={formData.invitationMethod === 'WHATSAPP'}
                        onChange={(e) => setFormData({ ...formData, invitationMethod: e.target.value as InviteMethod })}
                        className="hidden"
                      />
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">WhatsApp</span>
                    </motion.label>
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                        formData.invitationMethod === 'EMAIL'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value="EMAIL"
                        checked={formData.invitationMethod === 'EMAIL'}
                        onChange={(e) => setFormData({ ...formData, invitationMethod: e.target.value as InviteMethod })}
                        className="hidden"
                      />
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">Email</span>
                    </motion.label>
                  </div>
                </div>

                {/* Contact */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    {formData.invitationMethod === 'WHATSAPP' ? 'No. WhatsApp' : 'Email'} *
                  </label>
                  <input
                    type={formData.invitationMethod === 'EMAIL' ? 'email' : 'tel'}
                    value={formData.invitationMethod === 'WHATSAPP' ? formData.customerWhatsapp : formData.customerEmail}
                    onChange={(e) => setFormData({
                      ...formData,
                      [formData.invitationMethod === 'WHATSAPP' ? 'customerWhatsapp' : 'customerEmail']: e.target.value,
                    })}
                    placeholder={formData.invitationMethod === 'WHATSAPP' ? '6281234567890' : 'email@example.com'}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Existing Campaigns */}
        {campaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mt-6"
          >
            <h2 className="text-xl font-semibold mb-4">Campaign Anda ({campaigns.length})</h2>
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const business = businesses.find((b) => b.id === campaign.business_id)
                return (
                  <motion.div
                    key={campaign.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      {campaign.product_image ? (
                        <Image
                          src={campaign.product_image}
                          alt={campaign.title}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Megaphone className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
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
                          <span className="text-xs text-gray-500">{campaign.customer_name}</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyRecordLink(campaign.id)}
                            className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Link
                          </motion.button>
                          {campaign.customer_whatsapp && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSendInvitation(campaign.id)}
                              className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg"
                            >
                              <Send className="w-3 h-3" />
                              Kirim WA
                            </motion.button>
                          )}
                          <Link href={`/record/${campaign.id}`} target="_blank">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Buka
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
