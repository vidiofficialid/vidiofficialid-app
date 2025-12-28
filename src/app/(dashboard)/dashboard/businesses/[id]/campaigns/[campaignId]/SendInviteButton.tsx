"use client"

import { useState } from "react"
import { MessageCircle, Mail, Loader2 } from "lucide-react"

interface SendInviteButtonProps {
  campaignId: string
  customerName: string
  customerWhatsapp: string | null
  customerEmail: string | null
  recordingUrl: string
  brandName: string
}

export function SendInviteButton({
  campaignId,
  customerName,
  customerWhatsapp,
  customerEmail,
  recordingUrl,
  brandName
}: SendInviteButtonProps) {
  const [sending, setSending] = useState(false)

  const sendWhatsApp = () => {
    if (!customerWhatsapp) return
    
    // Format nomor WA
    let phone = customerWhatsapp.replace(/\D/g, '')
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1)
    }
    
    const message = encodeURIComponent(
      `Halo ${customerName}! 👋\n\n` +
      `Kami dari ${brandName} ingin mengundang Anda untuk memberikan video testimonial.\n\n` +
      `Silakan klik link berikut untuk merekam:\n${recordingUrl}\n\n` +
      `Terima kasih! 🙏`
    )
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const sendEmail = async () => {
    if (!customerEmail) return
    
    const subject = encodeURIComponent(`Undangan Video Testimonial - ${brandName}`)
    const body = encodeURIComponent(
      `Halo ${customerName},\n\n` +
      `Kami dari ${brandName} ingin mengundang Anda untuk memberikan video testimonial.\n\n` +
      `Silakan klik link berikut untuk merekam:\n${recordingUrl}\n\n` +
      `Terima kasih!`
    )
    
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {customerWhatsapp && (
        <button
          onClick={sendWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Kirim via WhatsApp
        </button>
      )}
      
      {customerEmail && (
        <button
          onClick={sendEmail}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          <Mail className="w-5 h-5" />
          Kirim via Email
        </button>
      )}
      
      {!customerWhatsapp && !customerEmail && (
        <p className="text-gray-500 text-sm">
          Tidak ada kontak pelanggan. Silakan edit campaign untuk menambahkan email atau WhatsApp.
        </p>
      )}
    </div>
  )
}
