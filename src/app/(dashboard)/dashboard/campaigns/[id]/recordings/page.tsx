import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Video, Calendar, Clock, AlertTriangle, Download } from "lucide-react"
import { RecordingCard } from "./RecordingCard"

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignRecordingsPage({ params }: Props) {
  const session = await auth()
  const { id } = await params

  const campaign = await prisma.campaign.findFirst({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          logo: true,
          userId: true
        }
      },
      testimonials: {
        orderBy: { recordedAt: "desc" }
      }
    }
  })

  if (!campaign || campaign.business.userId !== session?.user?.id) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getDaysRemaining = (recordedAt: Date) => {
    const uploadDate = new Date(recordedAt)
    const deleteDate = new Date(uploadDate.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days
    const now = new Date()
    const daysRemaining = Math.ceil((deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/dashboard/campaigns" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Campaigns
        </Link>
        
        <div className="flex items-start gap-4">
          {campaign.business.logo ? (
            <Image 
              src={campaign.business.logo} 
              alt={campaign.business.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-[#FDC435] rounded-xl flex items-center justify-center">
              <span className="font-bold text-black">{campaign.business.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-black">{campaign.title}</h1>
            <p className="text-gray-600 text-sm">
              {campaign.business.name} • {campaign.customerName}
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Rekaman akan dihapus otomatis setelah 15 hari</p>
            <p className="text-xs text-yellow-700 mt-1">
              Segera download rekaman yang ingin Anda simpan. Setelah 15 hari sejak diupload, rekaman akan dihapus dari server secara otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Recordings */}
      {campaign.testimonials.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">Belum ada rekaman</h2>
          <p className="text-gray-600 text-sm">
            Kirim undangan ke pelanggan untuk mulai mengumpulkan video testimonial
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Video className="w-5 h-5 text-gray-400" />
              {campaign.testimonials.length} Rekaman
            </h2>
          </div>

          <div className="grid gap-4">
            {campaign.testimonials.map((testimonial) => {
              const daysRemaining = getDaysRemaining(testimonial.recordedAt)
              
              return (
                <RecordingCard
                  key={testimonial.id}
                  testimonial={{
                    id: testimonial.id,
                    videoUrl: testimonial.videoUrl,
                    status: testimonial.status,
                    recordedAt: testimonial.recordedAt.toISOString(),
                    cloudinaryId: testimonial.cloudinaryId
                  }}
                  daysRemaining={daysRemaining}
                  campaignId={campaign.id}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
