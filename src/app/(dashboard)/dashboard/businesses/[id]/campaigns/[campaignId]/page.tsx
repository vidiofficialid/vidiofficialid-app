import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, MessageSquare, User, Mail, Phone } from "lucide-react"
import { SendInviteButton } from "./SendInviteButton"
import { CopyLinkButton } from "./CopyLinkButton"

interface Props {
  params: Promise<{ id: string; campaignId: string }>
}

export default async function CampaignDetailPage({ params }: Props) {
  const session = await auth()
  const { id: businessId, campaignId } = await params

  const campaign = await prisma.campaign.findFirst({
    where: { 
      id: campaignId,
      businessId: businessId 
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          logo: true,
          userId: true
        }
      },
      _count: {
        select: { testimonials: true }
      }
    }
  })

  if (!campaign || campaign.business.userId !== session?.user?.id) {
    notFound()
  }

  const recordingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${campaign.id}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700'
      case 'INVITED': return 'bg-blue-100 text-blue-700'
      case 'RECORDED': return 'bg-green-100 text-green-700'
      case 'COMPLETED': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft'
      case 'INVITED': return 'Undangan Terkirim'
      case 'RECORDED': return 'Video Diterima'
      case 'COMPLETED': return 'Selesai'
      default: return status
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/dashboard/businesses/${businessId}/campaigns`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusLabel(campaign.status)}
                </span>
                <span className="text-sm text-gray-500">• {campaign._count.testimonials} video</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Link */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-black mb-3 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-gray-400" />
          Link Recording
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={recordingUrl}
            readOnly
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
          />
          <CopyLinkButton url={recordingUrl} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Kirim link ini ke pelanggan untuk merekam video testimonial
        </p>
      </div>

      {/* Send Invite */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-black mb-3">Kirim Undangan</h2>
        <SendInviteButton 
          campaignId={campaign.id}
          customerName={campaign.customerName}
          customerWhatsapp={campaign.customerWhatsapp}
          customerEmail={campaign.customerEmail}
          recordingUrl={recordingUrl}
          brandName={campaign.brandName}
        />
      </div>

      {/* Campaign Info */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-black mb-4">Informasi Campaign</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nama Merek/Produk</label>
            <p className="text-black font-medium">{campaign.brandName}</p>
          </div>

          {campaign.productImage && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Foto Produk</label>
              <Image 
                src={campaign.productImage} 
                alt={campaign.brandName}
                width={120}
                height={120}
                className="w-24 h-24 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Script */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-black mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          Script Testimoni
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.testimonialScript}</p>
        </div>
        {campaign.gestureGuide && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 block mb-1">Panduan Gesture:</label>
            <p className="text-sm text-gray-600">{campaign.gestureGuide}</p>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-black mb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          Data Pelanggan
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{campaign.customerName}</span>
          </div>
          {campaign.customerEmail && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{campaign.customerEmail}</span>
            </div>
          )}
          {campaign.customerWhatsapp && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{campaign.customerWhatsapp}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info about viewing recordings */}
      {campaign._count.testimonials > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            📹 <strong>{campaign._count.testimonials} video</strong> testimonial sudah diterima. 
            <Link href="/dashboard/campaigns" className="underline ml-1">
              Lihat di menu Campaigns
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
