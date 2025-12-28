import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Video, Settings, Building2 } from "lucide-react"
import { MobileSidebar } from "@/components/dashboard/MobileSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <MobileSidebar user={{ name: session.user?.name, email: session.user?.email }} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex-col">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Image src="/logo.svg" alt="vidiofficial" width={40} height={40} />
          <span className="font-bold text-lg">VidiOfficialID</span>
        </Link>

        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/businesses" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700">
            <Building2 className="w-5 h-5" />
            Bisnis Saya
          </Link>
          <Link href="/dashboard/campaigns" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700">
            <Video className="w-5 h-5" />
            Campaigns
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-[#FDC435] rounded-full flex items-center justify-center">
              <span className="font-semibold text-black">{session.user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-0 p-4 lg:p-8">{children}</main>
    </div>
  )
}
