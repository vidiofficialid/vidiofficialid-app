"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Upload, X, AlertCircle } from "lucide-react"
import Image from "next/image"

const JASA_OPTIONS = [
  "Influencer",
  "Notaris",
  "Konsultan",
  "Desainer",
  "Fotografer",
  "Event Organizer",
  "Digital Marketing",
  "Software Developer",
  "Lainnya"
]

const PRODUK_OPTIONS = [
  "Merchandise",
  "Baju Muslim",
  "Fashion",
  "Makanan & Minuman",
  "Elektronik",
  "Kosmetik",
  "Furniture",
  "Handcraft",
  "Lainnya"
]

export default function SetupBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [nibWarning, setNibWarning] = useState("")
  
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    nib: "",
    kbli: "",
    productCategory: "" as "JASA" | "PRODUK" | "",
    productType: "",
    productTypeOther: "",
    email: "",
    whatsapp: "",
    logo: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // NIB validation warning
    if (name === "nib") {
      const digitsOnly = value.replace(/\D/g, "")
      if (digitsOnly.length > 0 && digitsOnly.length !== 13) {
        setNibWarning(`NIB biasanya 13 digit, kamu memasukkan ${digitsOnly.length} digit`)
      } else {
        setNibWarning("")
      }
    }

    // Reset product type when category changes
    if (name === "productCategory") {
      setFormData(prev => ({ ...prev, productType: "", productTypeOther: "" }))
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("logo", file)

      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: formDataUpload
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setFormData(prev => ({ ...prev, logo: data.url }))
    } catch (err: any) {
      setError(err.message || "Gagal upload logo")
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: "" }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      router.push("/dashboard")
      router.refresh()
    } catch { 
      setError("Terjadi kesalahan") 
    } finally { 
      setLoading(false) 
    }
  }

  const productOptions = formData.productCategory === "JASA" ? JASA_OPTIONS : PRODUK_OPTIONS

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FDC435] rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">Daftarkan Usaha Kamu</h1>
        <p className="text-gray-600">Lengkapi informasi usaha untuk mulai mengumpulkan video testimonial</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
        
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Logo Usaha</label>
          <div className="flex items-center gap-4">
            {formData.logo ? (
              <div className="relative">
                <Image 
                  src={formData.logo} 
                  alt="Logo" 
                  width={80} 
                  height={80} 
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FDC435] transition-colors">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-[#FDC435] rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            <div className="text-sm text-gray-500">
              <p>Format: PNG, JPEG, JPG</p>
              <p>Maks: 5MB</p>
            </div>
          </div>
        </div>

        {/* Nama Badan Usaha */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Badan Usaha <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
            placeholder="Contoh: PT Global Inovasi Strategis"
          />
          <p className="text-xs text-gray-500 mt-1">Kosongkan jika belum memiliki badan usaha</p>
        </div>

        {/* Nama Pemilik Usaha */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Pemilik Usaha <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
            placeholder="Nama lengkap pemilik usaha"
          />
        </div>

        {/* NIB */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nomor Induk Berusaha (NIB) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nib"
            value={formData.nib}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
            placeholder="13 digit angka NIB"
          />
          {nibWarning && (
            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {nibWarning}
            </p>
          )}
        </div>

        {/* KBLI */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            KBLI <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="kbli"
            value={formData.kbli}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
            placeholder="Kode KBLI"
          />
          <p className="text-xs text-gray-500 mt-1">Klasifikasi Baku Lapangan Usaha Indonesia</p>
        </div>

        {/* Kategori Produk - Radio */}
        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Kategori Produk <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="productCategory"
                value="JASA"
                checked={formData.productCategory === "JASA"}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#FDC435] focus:ring-[#FDC435]"
              />
              <span>Jasa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="productCategory"
                value="PRODUK"
                checked={formData.productCategory === "PRODUK"}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#FDC435] focus:ring-[#FDC435]"
              />
              <span>Produk</span>
            </label>
          </div>
        </div>

        {/* Jenis Produk - Dropdown */}
        {formData.productCategory && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Jenis {formData.productCategory === "JASA" ? "Jasa" : "Produk"} <span className="text-red-500">*</span>
            </label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none bg-white"
            >
              <option value="">Pilih jenis {formData.productCategory === "JASA" ? "jasa" : "produk"}</option>
              {productOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}

        {/* Input Lainnya */}
        {formData.productType === "Lainnya" && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Jelaskan Jenis {formData.productCategory === "JASA" ? "Jasa" : "Produk"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productTypeOther"
              value={formData.productTypeOther}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
              placeholder={`Jelaskan jenis ${formData.productCategory === "JASA" ? "jasa" : "produk"} kamu`}
            />
          </div>
        )}

        {/* Email Usaha */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Email Usaha <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
            placeholder="email@usaha.com"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            WhatsApp PIC Usaha <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FDC435] focus:outline-none"
            placeholder="08123456789"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Menyimpan..." : "Daftarkan Usaha"}
        </button>
      </form>
    </div>
  )
}
