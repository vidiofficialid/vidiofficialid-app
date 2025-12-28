import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Plus, Video, ArrowLeft, ExternalLink, Eye } from "lucide-react"
import CopyLinkButton from "./CopyLinkButton"

export default async function BusinessCampaignsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth()
  const { id } = await params
  
  const business = await prisma.business.findFirst({
    where: { id, userId: session?.user?.id },
    include: { 
      campaigns: { 
        include: { testimonials: true },
        orderBy: { createdAt: "desc" }
      } 
    }
  })

  if (!business) notFound()

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <Link href="/dashboard/businesses" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Bisnis Saya
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {business.logo ? (
                <Image src={business.logo} alt={business.name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FDC435]">
                  <span className="text-xl font-bold text-black">{business.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-black">{business.name}</h1>
              <p className="text-sm text-gray-600">{business.campaigns.length} campaign • {business.campaigns.reduce((acc, c) => acc + c.testimonials.length, 0)} testimonial</p>
            </div>
          </div>
          
          <Link href={`/dashboard/businesses/${business.id}/campaigns/new`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 text-sm lg:text-base">
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" /> Buat Campaign
            </button>
          </Link>
        </div>
      </div>

      {business.campaigns.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">Belum ada campaign</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm lg:text-base">
            Buat campaign pertama untuk mulai mengumpulkan video testimonial dari pelanggan {business.name}
          </p>
          <Link href={`/dashboard/businesses/${business.id}/campaigns/new`}>
            <button className="bg-[#FDC435] text-black px-6 py-2.5 rounded-full font-medium hover:bg-yellow-400">
              Buat Campaign Pertama
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 lg:gap-4">
          {business.campaigns.map((campaign) => {
            const recordedCount = campaign.testimonials.filter(t => t.status === 'APPROVED' || t.status === 'PENDING').length
            const recordingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${campaign.id}`
            
            return (
              <div key={campaign.id} className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base lg:text-lg font-semibold text-black">{campaign.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'RECORDED' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'INVITED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {campaign.status === 'COMPLETED' ? 'Selesai' :
                         campaign.status === 'RECORDED' ? 'Terekam' :
                         campaign.status === 'INVITED' ? 'Terkirim' : 'Draft'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{campaign.brandName}</span> • untuk {campaign.customerName}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm text-gray-500">
                      <span>{recordedCount} testimonial</span>
                      <span>•</span>
                      <span>{new Date(campaign.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                    <CopyLinkButton link={recordingLink} />
                    
                    <a 
                      href={`/r/${campaign.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                      title="Buka halaman rekaman"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </a>
                    
                    <Link href={`/dashboard/businesses/${business.id}/campaigns/${campaign.id}`}>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
