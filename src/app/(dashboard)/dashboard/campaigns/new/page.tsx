"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Video, Upload, X, AlertCircle, Sparkles, MessageSquare, User, Mail, Phone } from "lucide-react"

interface Business {
  id: string
  name: string
  logo: string | null
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [businesses, setBusinesses] = useState<Business[]>([])
  
  const [formData, setFormData] = useState({
    businessId: "",
    title: "",
    brandName: "",
    productImage: "",
    testimonialScript: "",
    gestureGuide: "",
    customerName: "",
    customerEmail: "",
    customerWhatsapp: ""
  })

  useEffect(() => {
    fetch("/api/business")
      .then(res => res.json())
      .then(data => {
        setBusinesses(data.businesses || [])
        if (data.businesses?.length === 1) {
          setFormData(prev => ({ ...prev, businessId: data.businesses[0].id }))
        }
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("logo", file)
      const res = await fetch("/api/upload/logo", { method: "POST", body: formDataUpload })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormData(prev => ({ ...prev, productImage: data.url }))
    } catch (err: any) {
      setError(err.message || "Gagal upload gambar")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => setFormData(prev => ({ ...prev, productImage: "" }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/dashboard/campaigns/${data.campaign.id}`)
      router.refresh()
    } catch { setError("Terjadi kesalahan") }
    finally { setLoading(false) }
  }

  const scriptTemplates = [
    "Hai, nama saya [NAMA]. Saya sudah menggunakan [PRODUK] selama [WAKTU] dan hasilnya luar biasa! Yang paling saya suka adalah [FITUR]. Sangat recommended!",
    "Sebelum pakai [PRODUK], saya punya masalah [MASALAH]. Tapi sekarang setelah pakai [PRODUK], semuanya berubah! Terima kasih [BRAND]!",
    "Saya [NAMA] dari [KOTA]. Produk [PRODUK] ini benar-benar membantu saya. Kualitasnya bagus dan pelayanannya ramah. Recommended banget!"
  ]

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-black mb-2">Buat Campaign Baru</h1>
        <p className="text-sm lg:text-base text-gray-600">Kumpulkan video testimonial dari pelanggan kamu</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-start gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Campaign */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Video className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-black">Informasi Campaign</h2>
          </div>

          <div className="space-y-4">
            {businesses.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">Pilih Bisnis <span className="text-red-500">*</span></label>
                <select name="businessId" value={formData.businessId} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none bg-white text-sm lg:text-base">
                  <option value="">Pilih bisnis...</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-2">Judul Campaign <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="Contoh: Testimoni Pelanggan Januari 2025" />
              <p className="text-xs text-gray-500 mt-1">Judul ini hanya untuk referensi internal kamu</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Nama Merek/Produk/Jasa <span className="text-red-500">*</span></label>
              <input type="text" name="brandName" value={formData.brandName} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="Contoh: Kopi Nusantara, Jasa Desain Logo" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Foto Produk/Jasa <span className="text-gray-400 font-normal">(opsional)</span></label>
              <div className="flex items-center gap-4">
                {formData.productImage ? (
                  <div className="relative">
                    <Image src={formData.productImage} alt="Product" width={80} height={80} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                    <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FDC435] transition-colors">
                    {uploading ? <div className="w-6 h-6 border-2 border-gray-300 border-t-[#FDC435] rounded-full animate-spin" /> : <><Upload className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-400 mt-1">Upload</span></>}
                    <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
                <p className="text-xs text-gray-500">Akan ditampilkan kepada pelanggan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Script Testimoni */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-black">Script Testimoni</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Pilih Template</label>
              <div className="grid grid-cols-1 gap-2">
                {scriptTemplates.map((template, idx) => (
                  <button key={idx} type="button" onClick={() => setFormData(prev => ({ ...prev, testimonialScript: template }))} className="text-left p-3 border border-gray-200 rounded-lg hover:border-[#FDC435] hover:bg-yellow-50 transition-colors text-xs lg:text-sm text-gray-600">
                    <span className="flex items-center gap-1 text-purple-600 font-medium mb-1"><Sparkles className="w-3 h-3" /> Template {idx + 1}</span>
                    {template.substring(0, 60)}...
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Kalimat Testimoni <span className="text-red-500">*</span></label>
              <textarea name="testimonialScript" value={formData.testimonialScript} onChange={handleInputChange} required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="Tulis kalimat yang akan dibaca oleh pelanggan saat merekam testimoni..." />
              <p className="text-xs text-gray-500 mt-1">Kalimat ini akan ditampilkan seperti teleprompter saat pelanggan merekam</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Panduan Gesture <span className="text-gray-400 font-normal">(opsional)</span></label>
              <textarea name="gestureGuide" value={formData.gestureGuide} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="Contoh: Tersenyum, tunjukkan produk, acungkan jempol di akhir" />
            </div>
          </div>
        </div>

        {/* Section 3: Data Pelanggan */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-black">Data Pelanggan</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Nama Pelanggan <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="Nama pelanggan yang akan diundang" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Email Pelanggan</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="email@pelanggan.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">WhatsApp Pelanggan</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" name="customerWhatsapp" value={formData.customerWhatsapp} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none text-sm lg:text-base" placeholder="08123456789" />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">💡 <strong>Tips:</strong> Isi minimal salah satu (Email atau WhatsApp) untuk mengirim undangan.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-50 text-sm lg:text-base">Batal</button>
          <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 text-sm lg:text-base">{loading ? "Menyimpan..." : "Buat Campaign"}</button>
        </div>
      </form>
    </div>
  )
}
