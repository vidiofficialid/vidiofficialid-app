'use client'

import { useState } from 'react'
import { Navbar, Footer } from '@/components/landing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value && !value.startsWith('62')) {
      if (value.startsWith('0')) {
        value = '62' + value.slice(1)
      } else {
        value = '62' + value
      }
    }
    setFormData((prev) => ({ ...prev, whatsapp: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      setIsSubmitted(true)
      setFormData({ name: '', email: '', whatsapp: '', message: '' })
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Hubungi Kami
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ada pertanyaan atau ingin berkolaborasi? Kami senang mendengar dari Anda!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Informasi Kontak
              </h2>

              <div className="space-y-6">
                <a
                  href="https://wa.me/6281283835553"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-shadow group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">+62 812 8383 5553</p>
                    <p className="text-sm text-green-600 mt-1">Klik untuk chat langsung</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@vidi.official.id</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Telepon</h3>
                    <p className="text-gray-600">+62 812 8383 5553</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Lokasi</h3>
                    <p className="text-gray-600">Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-10">
                <h3 className="font-bold text-gray-900 mb-4">Ikuti Kami</h3>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com/vidi.official.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Pesan Terkirim!
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Terima kasih sudah menghubungi kami. Tim kami akan segera merespons.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      Kirim Pesan Lagi
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Kirim Pesan
                    </h2>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="name" className="text-gray-700 mb-2 block">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700 mb-2 block">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp" className="text-gray-700 mb-2 block">
                        Nomor WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          +
                        </span>
                        <Input
                          id="whatsapp"
                          name="whatsapp"
                          type="tel"
                          required
                          value={formData.whatsapp}
                          onChange={handleWhatsAppChange}
                          placeholder="628123456789"
                          className="h-12 pl-7"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Format: 628xxx (tanpa tanda + atau spasi)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-gray-700 mb-2 block">
                        Pesan <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tulis pesan Anda di sini..."
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gray-900 text-white hover:bg-amber-500 hover:text-gray-900 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
