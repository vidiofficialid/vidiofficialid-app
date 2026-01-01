'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dsv8iy2la/image/upload/v1766922503/logo_k0q2cc.png"
            alt="VidiOfficialID"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="font-bold text-lg text-gray-900 hidden sm:block">
            VidiOfficialID
          </span>
        </Link>

        {/* Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </motion.button>
      </div>
    </header>
  )
}
