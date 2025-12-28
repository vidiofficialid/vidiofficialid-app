import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Video, Users, TrendingUp, Plus, Building2 } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  const businesses = await prisma.business.findMany({
    where: { userId: session?.user?.id },
    include: { campaigns: { include: { testimonials: true } } }
  })

  const totalCampaigns = businesses.reduce((acc, b) => acc + b.campaigns.length, 0)
  const totalTestimonials = businesses.reduce((acc, b) => 
    acc + b.campaigns.reduce((acc2, c) => acc2 + c.testimonials.length, 0), 0
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-black">
            Selamat datang, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            {businesses.length > 0 
              ? `Kamu memiliki ${businesses.length} bisnis terdaftar`
              : "Daftarkan bisnis untuk mulai"
            }
          </p>
        </div>
        
        {/* Tombol mengarah ke Bisnis Saya */}
        <Link href="/dashboard/businesses" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 text-sm lg:text-base">
            <Building2 className="w-4 h-4 lg:w-5 lg:h-5" /> 
            {businesses.length > 0 ? "Kelola Bisnis" : "Daftarkan Bisnis"}
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 text-xs lg:text-sm truncate">Total Bisnis</p>
              <p className="text-xl lg:text-2xl font-bold text-black">{businesses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 text-xs lg:text-sm truncate">Campaigns</p>
              <p className="text-xl lg:text-2xl font-bold text-black">{totalCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 text-xs lg:text-sm truncate">Testimonials</p>
              <p className="text-xl lg:text-2xl font-bold text-black">{totalTestimonials}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 text-xs lg:text-sm truncate">Conversion</p>
              <p className="text-xl lg:text-2xl font-bold text-black">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {businesses.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#FDC435] rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
            <Building2 className="w-8 h-8 lg:w-10 lg:h-10 text-black" />
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-black mb-2">Mulai dengan Mendaftarkan Bisnis</h2>
          <p className="text-sm lg:text-base text-gray-600 mb-6 max-w-md mx-auto">
            Daftarkan bisnis kamu untuk mulai membuat campaign dan mengumpulkan video testimonial.
          </p>
          <Link href="/dashboard/businesses/new">
            <button className="bg-black text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-medium hover:bg-gray-800 text-sm lg:text-base">
              Daftarkan Bisnis Sekarang
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Bisnis Terdaftar */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base lg:text-lg font-bold text-black">Bisnis Terdaftar</h2>
              <Link href="/dashboard/businesses" className="text-xs lg:text-sm text-gray-600 hover:text-black">
                Lihat Semua →
              </Link>
            </div>
            <div className="space-y-2 lg:space-y-3">
              {businesses.slice(0, 3).map((business) => (
                <Link
                  key={business.id}
                  href={`/dashboard/businesses/${business.id}/campaigns`}
                  className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {business.logo ? (
                      <Image src={business.logo} alt={business.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FDC435]">
                        <span className="font-bold text-black">{business.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm lg:text-base truncate">{business.name}</p>
                    <p className="text-xs text-gray-500">{business.campaigns.length} campaign</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full hidden sm:block">
                    {business.productCategory}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Campaign Terbaru */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base lg:text-lg font-bold text-black">Campaign Terbaru</h2>
            </div>
            {totalCampaigns === 0 ? (
              <div className="text-center py-6 lg:py-8">
                <Video className="w-8 h-8 lg:w-10 lg:h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-2">Belum ada campaign</p>
                <p className="text-xs text-gray-400">Pilih bisnis untuk membuat campaign</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {businesses.flatMap(b => b.campaigns.map(c => ({ ...c, businessName: b.name, businessId: b.id }))).slice(0, 3).map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/businesses/${campaign.businessId}/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-2.5 lg:p-3 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-black text-sm lg:text-base truncate">{campaign.title}</p>
                      <p className="text-xs text-gray-500">{campaign.businessName} • {campaign.testimonials.length} testimonial</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {campaign.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
