import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Video, Users, Calendar, Building2 } from "lucide-react"
import { CampaignActions } from "./CampaignActions"

export default async function CampaignsPage() {
  const session = await auth()
  
  const businesses = await prisma.business.findMany({
    where: { userId: session?.user?.id },
    select: { id: true }
  })

  const businessIds = businesses.map(b => b.id)

  const campaigns = await prisma.campaign.findMany({
    where: { businessId: { in: businessIds } },
    include: { 
      business: { 
        select: { 
          id: true,
          name: true, 
          logo: true 
        } 
      },
      testimonials: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

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
      case 'INVITED': return 'Terkirim'
      case 'RECORDED': return 'Video Diterima'
      case 'COMPLETED': return 'Selesai'
      default: return status
    }
  }

  return (
    <div>
      {/* Header - No Buat Campaign button */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-black">Campaigns</h1>
        <p className="text-sm lg:text-base text-gray-600">
          {campaigns.length} campaign terdaftar
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          💡 <strong>Tips:</strong> Untuk membuat campaign baru, buka <Link href="/dashboard/businesses" className="underline font-medium">Bisnis Saya</Link> → pilih bisnis → buat campaign.
        </p>
      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">Belum ada campaign</h2>
          <p className="text-gray-600 mb-6 text-sm lg:text-base">
            Buat campaign pertama untuk mulai mengumpulkan video testimonial
          </p>
          <Link href="/dashboard/businesses">
            <button className="bg-[#FDC435] text-black px-6 py-2.5 rounded-full font-medium hover:bg-yellow-400">
              Buka Bisnis Saya
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const pendingCount = campaign.testimonials.filter(t => t.status === 'PENDING').length
            const approvedCount = campaign.testimonials.filter(t => t.status === 'APPROVED').length
            const totalTestimonials = campaign.testimonials.length

            return (
              <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-5">
                <div className="flex items-center gap-3">
                  {/* Business Logo */}
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {campaign.business.logo ? (
                      <Image 
                        src={campaign.business.logo} 
                        alt={campaign.business.name} 
                        width={48} 
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-black text-sm lg:text-base truncate">{campaign.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {campaign.business.name}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.customerName}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {totalTestimonials} video
                      </span>
                    </div>
                  </div>

                  {/* Testimonial badges */}
                  <div className="hidden sm:flex items-center gap-2">
                    {pendingCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        {pendingCount} pending
                      </span>
                    )}
                    {approvedCount > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {approvedCount} approved
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <CampaignActions 
                    campaignId={campaign.id} 
                    campaignTitle={campaign.title}
                    hasTestimonials={totalTestimonials > 0}
                  />
                </div>

                {/* Mobile badges */}
                {(pendingCount > 0 || approvedCount > 0) && (
                  <div className="sm:hidden flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {pendingCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        {pendingCount} pending
                      </span>
                    )}
                    {approvedCount > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {approvedCount} approved
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
