'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Minus,
  Upload,
  Save,
  Building2,
  ImageIcon,
  Loader2,
  Trash2,
  ArrowLeft,
  Pencil,
  X,
  Check,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business, ProductCategory } from '@/types/database'

interface CreateBusinessContentProps {
  userId: string
  existingBusinesses: Business[]
}

interface BusinessForm {
  id: string
  logo: string
  logoFile: File | null
  name: string
  category: ProductCategory
  description: string
  nib: string
  kbli: string
}

export function CreateBusinessContent({
  userId,
  existingBusinesses,
}: CreateBusinessContentProps) {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>(existingBusinesses)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)

  // Form state for creating NEW businesses
  const [businessForms, setBusinessForms] = useState<BusinessForm[]>([
    {
      id: Date.now().toString(),
      logo: '',
      logoFile: null,
      name: '',
      category: 'PRODUK',
      description: '',
      nib: '',
      kbli: '',
    },
  ])

  // Form state for EDITING a business
  const [editForm, setEditForm] = useState<BusinessForm | null>(null)

  const addBusinessForm = () => {
    setBusinessForms([
      ...businessForms,
      {
        id: Date.now().toString(),
        logo: '',
        logoFile: null,
        name: '',
        category: 'PRODUK',
        description: '',
        nib: '',
        kbli: '',
      },
    ])
  }

  const removeBusinessForm = (id: string) => {
    if (businessForms.length === 1) {
      alert('Minimal harus ada satu form bisnis!')
      return
    }
    setBusinessForms(businessForms.filter((form) => form.id !== id))
  }

  const updateBusinessForm = (
    id: string,
    field: keyof BusinessForm,
    value: string | File | null
  ) => {
    setBusinessForms(
      businessForms.map((form) =>
        form.id === id ? { ...form, [field]: value } : form
      )
    )
  }

  const handleImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
    isEditMode = false
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isEditMode && editForm) {
          setEditForm({ ...editForm, logo: reader.result as string, logoFile: file })
        } else {
          updateBusinessForm(id, 'logo', reader.result as string)
          updateBusinessForm(id, 'logoFile', file)
        }
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

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      for (const form of businessForms) {
        if (!form.name || !form.description) {
          alert('Mohon lengkapi semua field yang diperlukan!')
          setIsSubmitting(false)
          return
        }

        let logoUrl = ''
        if (form.logoFile) {
          logoUrl = await uploadToCloudinary(form.logoFile)
        }

        const slug = generateSlug(form.name) + '-' + Date.now()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('businesses').insert({
          user_id: userId,
          name: form.name,
          slug: slug,
          owner_name: form.name,
          logo: logoUrl || null,
          product_category: form.category,
          description: form.description,
          nib: form.nib || null,
          kbli: form.kbli || null,
        })

        if (error) {
          console.error('Error creating business:', error)
          alert('Gagal membuat bisnis: ' + error.message)
          setIsSubmitting(false)
          return
        }
      }

      alert(`${businessForms.length} bisnis berhasil dibuat!`)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat membuat bisnis')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus bisnis ini?')) return

    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('businesses')
        .delete()
        .eq('id', businessId)

      if (error) {
        alert('Gagal menghapus bisnis: ' + error.message)
        return
      }

      setBusinesses(businesses.filter((b) => b.id !== businessId))
      router.refresh()
      alert('Bisnis berhasil dihapus')
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    }
  }

  const openEditModal = (business: Business) => {
    setEditingBusiness(business)
    setEditForm({
      id: business.id,
      logo: business.logo || '',
      logoFile: null,
      name: business.name,
      category: business.product_category as ProductCategory,
      description: business.description || '',
      nib: business.nib || '',
      kbli: business.kbli || '',
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm || !editingBusiness) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      let logoUrl = editingBusiness.logo // Keep existing logo by default

      // Upload new logo if selected
      if (editForm.logoFile) {
        logoUrl = await uploadToCloudinary(editForm.logoFile)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('businesses')
        .update({
          name: editForm.name,
          product_category: editForm.category,
          description: editForm.description,
          logo: logoUrl,
          nib: editForm.nib || null,
          kbli: editForm.kbli || null,
        })
        .eq('id', editingBusiness.id)

      if (error) throw error

      setBusinesses(businesses.map(b => b.id === editingBusiness.id ? {
        ...b,
        name: editForm.name,
        product_category: editForm.category,
        description: editForm.description,
        logo: logoUrl,
        nib: editForm.nib,
        kbli: editForm.kbli
      } : b))

      alert('Bisnis berhasil diperbarui!')
      setEditingBusiness(null)
      router.refresh()

    } catch (error) {
      console.error('Error updating business:', error)
      alert('Gagal memperbarui bisnis')
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
        <h1 className="text-xl font-bold">Kelola Bisnis</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Buat Bisnis Baru</h2>
              <p className="text-gray-600 text-sm">
                Anda dapat membuat beberapa bisnis sekaligus
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addBusinessForm}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah</span>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {businessForms.map((form, index) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-2 border-gray-200 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Bisnis #{index + 1}</h3>
                  {businessForms.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeBusinessForm(form.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Minus className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Logo Bisnis</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
                      {form.logo ? (
                        <img
                          src={form.logo}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer inline-block">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 w-fit"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </motion.div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(form.id, e, false)}
                          className="hidden"
                        />
                      </label>
                      {form.logoFile && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {form.logoFile.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rest of inputs for CREATE form */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Bisnis *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateBusinessForm(form.id, 'name', e.target.value)}
                    placeholder="Contoh: Warung Kopi Nusantara"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['PRODUK', 'JASA'].map((cat) => (
                      <motion.label
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${form.category === cat
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name={`category-${form.id}`}
                          value={cat}
                          checked={form.category === cat}
                          onChange={(e) => updateBusinessForm(form.id, 'category', e.target.value as ProductCategory)}
                          className="hidden"
                        />
                        <span className="font-medium">{cat === 'PRODUK' ? 'Produk' : 'Jasa'}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateBusinessForm(form.id, 'description', e.target.value)}
                    placeholder="Jelaskan produk atau jasa Anda..."
                    rows={3}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">NIB</label>
                    <input
                      type="text"
                      value={form.nib}
                      onChange={(e) => updateBusinessForm(form.id, 'nib', e.target.value)}
                      placeholder="Nomor Induk Berusaha"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">KBLI</label>
                    <input
                      type="text"
                      value={form.kbli}
                      onChange={(e) => updateBusinessForm(form.id, 'kbli', e.target.value)}
                      placeholder="Kode KBLI"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan {businessForms.length} Bisnis
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Existing Businesses List */}
      {businesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">Bisnis Anda ({businesses.length})</h2>
          <div className="space-y-3">
            {businesses.map((business) => (
              <motion.div
                key={business.id}
                whileHover={{ scale: 1.01 }}
                className="border border-gray-200 rounded-xl p-4 flex items-center gap-3"
              >
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{business.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {business.product_category?.toLowerCase()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEditModal(business)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    title="Edit Bisnis"
                  >
                    <Pencil className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteBusiness(business.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Hapus Bisnis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Edit Business Modal */}
      <AnimatePresence>
        {editingBusiness && editForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-xl font-bold">Edit Bisnis</h3>
                  <button
                    type="button"
                    onClick={() => setEditingBusiness(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
                    {editForm.logo ? (
                      <img src={editForm.logo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer inline-block mb-2">
                      <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200">
                        <Upload className="w-4 h-4" />
                        Ganti Logo
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(editForm.id, e, true)}
                        className="hidden"
                      />
                    </label>
                    {editForm.logoFile && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> {editForm.logoFile.name}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nama Bisnis *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kategori *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['PRODUK', 'JASA'].map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${editForm.category === cat
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="edit_category"
                          value={cat}
                          checked={editForm.category === cat}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ProductCategory })}
                          className="hidden"
                        />
                        <span className="font-medium">{cat === 'PRODUK' ? 'Produk' : 'Jasa'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi *</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">NIB</label>
                    <input
                      type="text"
                      value={editForm.nib}
                      onChange={(e) => setEditForm({ ...editForm, nib: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">KBLI</label>
                    <input
                      type="text"
                      value={editForm.kbli}
                      onChange={(e) => setEditForm({ ...editForm, kbli: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingBusiness(null)}
                    className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
