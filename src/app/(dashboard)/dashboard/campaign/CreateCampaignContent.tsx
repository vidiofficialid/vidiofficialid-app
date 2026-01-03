'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles,
  Wand2,
  Clock,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  MessageSquare,
  HelpCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business, Campaign, InviteMethod } from '@/types/database'

interface CreateCampaignContentProps {
  businesses: Business[]
  existingCampaigns: Campaign[]
}

// AI Questions untuk generate script
const AI_QUESTIONS = [
  {
    id: 'problemToSolve',
    question: 'Masalah atau kebutuhan apa yang ingin diselesaikan dengan produk/jasa ini?',
    placeholder: 'Contoh: Kesulitan mencari jasa fotografi profesional dengan harga terjangkau',
    helpText: 'Ini akan membantu menciptakan konteks emosional yang relatable bagi calon konsumen'
  },
  {
    id: 'differentiation',
    question: 'Menurut Anda, apa yang membuat konsumen memilih produk/jasa ini dibandingkan pilihan lain?',
    placeholder: 'Contoh: Kualitas hasil foto yang konsisten, respons cepat, dan harga transparan',
    helpText: 'Untuk menemukan unique selling point (USP) secara alami'
  },
  {
    id: 'expectedExperience',
    question: 'Pengalaman apa yang diharapkan ketika konsumen menggunakan produk/jasa ini?',
    placeholder: 'Contoh: Proses booking mudah, sesi foto yang menyenangkan, hasil edit cepat',
    helpText: 'Menghasilkan narasi yang terasa jujur dan autentik'
  },
  {
    id: 'expectedBenefit',
    question: 'Manfaat atau dampak apa yang diharapkan setelah konsumen menggunakan produk/jasa ini?',
    placeholder: 'Contoh: Punya foto profesional untuk profil bisnis, meningkatkan kepercayaan klien',
    helpText: 'Menekankan benefit konkret seperti waktu, uang, kualitas, atau kepercayaan diri'
  },
  {
    id: 'targetRecommendation',
    question: 'Kepada siapa Anda ingin konsumen merekomendasikan produk/jasa Anda?',
    placeholder: 'Contoh: Pemilik UMKM yang butuh foto produk, freelancer yang butuh foto profesional',
    helpText: 'Menutup dengan call-to-action implisit yang kuat untuk pemasaran'
  }
]

type DurationType = 15 | 20 | 25
type StyleType = 'formal' | 'santai' | 'emosional'

export function CreateCampaignContent({
  businesses,
  existingCampaigns,
}: CreateCampaignContentProps) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>(existingCampaigns)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  
  // AI Script Generator States
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [aiError, setAiError] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  
  // AI Form Data
  const [aiFormData, setAiFormData] = useState({
    problemToSolve: '',
    differentiation: '',
    expectedExperience: '',
    expectedBenefit: '',
    targetRecommendation: '',
    duration: 20 as DurationType,
    stylePreference: 'santai' as StyleType,
  })

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

  // AI Script Generator Functions
  const handleGenerateScript = async () => {
    // Validasi semua pertanyaan sudah dijawab
    const requiredFields = ['problemToSolve', 'differentiation', 'expectedExperience', 'expectedBenefit', 'targetRecommendation']
    const missingFields = requiredFields.filter(field => !aiFormData[field as keyof typeof aiFormData])
    
    if (missingFields.length > 0) {
      setAiError('Mohon jawab semua pertanyaan terlebih dahulu')
      return
    }

    setIsGeneratingScript(true)
    setAiError('')
    setGeneratedScript('')

    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiFormData,
          brandName: formData.brandName || formData.name || 'Produk/Jasa'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal generate script')
      }

      setGeneratedScript(data.script)
    } catch (error) {
      console.error('Generate script error:', error)
      setAiError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const handleUseAIScript = () => {
    setFormData({ ...formData, testimonialScript: generatedScript })
    setShowAIGenerator(false)
    setGeneratedScript('')
    setCurrentQuestionIndex(0)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < AI_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const isAllQuestionsAnswered = () => {
    return AI_QUESTIONS.every(q => aiFormData[q.id as keyof typeof aiFormData])
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
      setAiFormData({
        problemToSolve: '',
        differentiation: '',
        expectedExperience: '',
        expectedBenefit: '',
        targetRecommendation: '',
        duration: 20,
        stylePreference: 'santai',
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat membuat campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
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
        <h1 className="text-xl font-bold">Kelola Campaign</h1>
      </div>

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

              {/* Script Testimoni dengan AI Generator */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    Script Testimoni
                  </label>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-purple-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    {showAIGenerator ? 'Tutup AI Generator' : 'Generate dengan AI'}
                  </motion.button>
                </div>

                {/* AI Generator Panel */}
                <AnimatePresence>
                  {showAIGenerator && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Wand2 className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-900">AI Script Generator</h4>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          Jawab 5 pertanyaan berikut untuk membantu AI membuat script testimoni yang autentik dan meyakinkan.
                        </p>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-1 mb-4">
                          {AI_QUESTIONS.map((_, index) => (
                            <div
                              key={index}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                index < currentQuestionIndex 
                                  ? 'bg-purple-600' 
                                  : index === currentQuestionIndex 
                                    ? 'bg-purple-400' 
                                    : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Question Card */}
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mb-4"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">
                              {currentQuestionIndex + 1}/5
                            </span>
                            <p className="text-sm font-medium text-gray-800">
                              {AI_QUESTIONS[currentQuestionIndex].question}
                            </p>
                          </div>
                          
                          <div className="flex items-start gap-1 mb-2 text-xs text-gray-500">
                            <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{AI_QUESTIONS[currentQuestionIndex].helpText}</span>
                          </div>
                          
                          <textarea
                            value={aiFormData[AI_QUESTIONS[currentQuestionIndex].id as keyof typeof aiFormData] as string}
                            onChange={(e) => setAiFormData({
                              ...aiFormData,
                              [AI_QUESTIONS[currentQuestionIndex].id]: e.target.value
                            })}
                            placeholder={AI_QUESTIONS[currentQuestionIndex].placeholder}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                          />
                        </motion.div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mb-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePrevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-50"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Sebelumnya
                          </motion.button>
                          
                          {currentQuestionIndex < AI_QUESTIONS.length - 1 ? (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleNextQuestion}
                              className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg"
                            >
                              Selanjutnya
                              <ChevronRight className="w-4 h-4" />
                            </motion.button>
                          ) : null}
                        </div>

                        {/* Duration & Style Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Durasi Script
                            </label>
                            <div className="flex gap-2">
                              {[15, 20, 25].map((duration) => (
                                <motion.button
                                  key={duration}
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setAiFormData({ ...aiFormData, duration: duration as DurationType })}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    aiFormData.duration === duration
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white border border-gray-300 text-gray-700'
                                  }`}
                                >
                                  {duration}s
                                </motion.button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              Gaya Bahasa
                            </label>
                            <select
                              value={aiFormData.stylePreference}
                              onChange={(e) => setAiFormData({ ...aiFormData, stylePreference: e.target.value as StyleType })}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="santai">Santai & Casual</option>
                              <option value="formal">Formal & Profesional</option>
                              <option value="emosional">Emosional & Story</option>
                            </select>
                          </div>
                        </div>

                        {/* Error Message */}
                        {aiError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {aiError}
                          </div>
                        )}

                        {/* Generate Button */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerateScript}
                          disabled={isGeneratingScript || !isAllQuestionsAnswered()}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isGeneratingScript ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              AI sedang membuat script...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Script dengan AI
                            </>
                          )}
                        </motion.button>

                        {!isAllQuestionsAnswered() && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            Jawab semua 5 pertanyaan untuk generate script
                          </p>
                        )}

                        {/* Generated Script Result */}
                        <AnimatePresence>
                          {generatedScript && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Check className="w-5 h-5 text-green-600" />
                                  <span className="font-semibold text-green-800">Script Hasil AI</span>
                                </div>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleGenerateScript}
                                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-600"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Generate Ulang
                                </motion.button>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border border-green-100 mb-4">
                                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                  {generatedScript}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleUseAIScript}
                                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Gunakan Saran AI
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setGeneratedScript('')}
                                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Manual Script Input */}
                <textarea
                  value={formData.testimonialScript}
                  onChange={(e) => setFormData({ ...formData, testimonialScript: e.target.value })}
                  placeholder="Ceritakan pengalaman menggunakan produk/jasa kami... (atau gunakan AI Generator di atas)"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                />
                {formData.testimonialScript && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.testimonialScript.split(' ').length} kata
                  </p>
                )}
              </div>

              {/* Gesture Description */}
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
    </div>
  )
}
