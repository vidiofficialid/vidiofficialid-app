'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Home, Megaphone } from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard/business',
      icon: Building2,
      label: 'Bisnis',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      href: '/dashboard',
      icon: Home,
      label: 'Home',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      isCenter: true,
    },
    {
      href: '/dashboard/campaign',
      icon: Megaphone,
      label: 'Campaign',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center py-2 px-3"
                >
                  {item.isCenter ? (
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        y: isActive ? -5 : 0,
                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                          : 'bg-gradient-to-br from-orange-400 to-orange-500'
                      }`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                      }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isActive ? item.bgColor : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? item.color : 'text-gray-500'
                        }`}
                      />
                    </motion.div>
                  )}
                  <span
                    className={`text-xs mt-1 font-medium ${
                      isActive
                        ? item.isCenter
                          ? 'text-orange-600'
                          : item.color
                        : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
