"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LayoutDashboard, Building2, Video, Settings } from "lucide-react"

interface MobileSidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="vidiofficial" width={32} height={32} />
          <span className="font-bold">VidiOfficialID</span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/dashboard/businesses" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
              <Building2 className="w-5 h-5" /> Bisnis Saya
            </Link>
            <Link href="/dashboard/campaigns" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
              <Video className="w-5 h-5" /> Campaigns
            </Link>
            <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
              <Settings className="w-5 h-5" /> Settings
            </Link>
          </nav>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[#FDC435] rounded-full flex items-center justify-center">
                <span className="font-semibold text-black">{user.name?.charAt(0) || "U"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
