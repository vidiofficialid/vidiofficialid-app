'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="VidiOfficialID"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold text-lg text-gray-800">VidiOfficialID</span>
          </Link>

          {/* Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="p-2 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
