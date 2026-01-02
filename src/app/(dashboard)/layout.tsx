'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/Header'
import { SideNavigation } from '@/components/dashboard/SideNavigation'
import { BottomNavigation } from '@/components/dashboard/BottomNavigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const pathname = usePathname()

  // Close sidenav on route change
  useEffect(() => {
    setIsSideNavOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader onMenuClick={() => setIsSideNavOpen(true)} />

      {/* Side Navigation */}
      <SideNavigation
        isOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
      />

      {/* Main Content */}
      <main className="pt-16 pb-24 px-4 max-w-7xl mx-auto">
        <div className="py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
