import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Plus, Building2, Edit, Trash2, Video } from "lucide-react"

export default async function BusinessesPage() {
  const session = await auth()
  
  const businesses = await prisma.business.findMany({
    where: { userId: session?.user?.id },
    include: { campaigns: { include: { testimonials: true } } },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-black">Bisnis Saya</h1>
          <p className="text-sm lg:text-base text-gray-600">Kelola semua bisnis yang kamu daftarkan</p>
        </div>
        <Link href="/dashboard/businesses/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 text-sm lg:text-base">
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" /> Tambah Bisnis
          </button>
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 lg:w-8 lg:h-8 text-gray-400" />
          </div>
          <h2 className="text-base lg:text-lg font-semibold text-black mb-2">Belum ada bisnis terdaftar</h2>
          <p className="text-sm lg:text-base text-gray-600 mb-6">Daftarkan bisnis pertama kamu untuk mulai membuat campaign</p>
          <Link href="/dashboard/businesses/new">
            <button className="bg-[#FDC435] text-black px-6 py-2.5 rounded-full font-medium hover:bg-yellow-400 text-sm lg:text-base">
              Daftarkan Bisnis Pertama
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 lg:gap-4">
          {businesses.map((business) => {
            const totalTestimonials = business.campaigns.reduce((acc, c) => acc + c.testimonials.length, 0)
            
            return (
              <div key={business.id} className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {business.logo ? (
                        <Image src={business.logo} alt={business.name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base lg:text-lg font-semibold text-black truncate">{business.name}</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {business.productCategory}
                        </span>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600 mb-2 truncate">
                        {business.companyName !== "-" ? business.companyName : business.ownerName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          {business.campaigns.length} campaign
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{totalTestimonials} testimonial</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Link href={`/dashboard/businesses/${business.id}/edit`} className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Edit className="w-4 h-4" />
                        <span className="sm:hidden lg:inline">Edit</span>
                      </button>
                    </Link>
                    <button className="p-2 hover:bg-red-50 rounded-lg border border-gray-200" title="Hapus">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    {/* Link ke halaman campaigns bisnis ini */}
                    <Link href={`/dashboard/businesses/${business.id}/campaigns`} className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FDC435] text-black rounded-lg text-sm font-medium hover:bg-yellow-400">
                        <Video className="w-4 h-4" />
                        Campaign
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
