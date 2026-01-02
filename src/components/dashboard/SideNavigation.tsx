'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Settings,
  Trash2,
  LogOut,
  MessageSquare,
  X,
  ChevronRight,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface SideNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const [isAccountOpen, setIsAccountOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const handleLogout = async () => {
    await signOut()
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg">Menu</h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                <p className="text-orange-100 text-sm">
                  Kelola akun dan testimoni Anda
                </p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                {/* Account Menu */}
                <div className="mb-2">
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-800">Account</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isAccountOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isAccountOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden ml-2 mt-2 space-y-1"
                      >
                        {/* Edit Profile */}
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => handleNavigation('/dashboard/account/profile')}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isActive('/dashboard/account/profile')
                              ? 'bg-orange-100 text-orange-700 shadow-sm'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <div
                            className="w-1 h-6 bg-orange-600 rounded-full transition-opacity"
                            style={{
                              opacity: isActive('/dashboard/account/profile') ? 1 : 0,
                            }}
                          />
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Edit Profil</span>
                        </motion.button>

                        {/* Edit Account */}
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => handleNavigation('/dashboard/account/settings')}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isActive('/dashboard/account/settings')
                              ? 'bg-orange-100 text-orange-700 shadow-sm'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <div
                            className="w-1 h-6 bg-orange-600 rounded-full transition-opacity"
                            style={{
                              opacity: isActive('/dashboard/account/settings') ? 1 : 0,
                            }}
                          />
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Edit Account</span>
                        </motion.button>

                        {/* Delete Account */}
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => handleNavigation('/dashboard/account/delete')}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isActive('/dashboard/account/delete')
                              ? 'bg-red-50 text-red-700 shadow-sm'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          <div
                            className="w-1 h-6 bg-red-600 rounded-full transition-opacity"
                            style={{
                              opacity: isActive('/dashboard/account/delete') ? 1 : 0,
                            }}
                          />
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Delete Account</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Testimonial Menu */}
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => handleNavigation('/dashboard/testimonials')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-2 ${
                    isActive('/dashboard/testimonials')
                      ? 'bg-orange-100 text-orange-700 shadow-md'
                      : 'hover:bg-orange-50 text-gray-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive('/dashboard/testimonials')
                        ? 'bg-orange-200'
                        : 'bg-orange-100'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="font-medium">Testimonial</span>
                </motion.button>

                {/* Logout Button */}
                <form action={handleLogout}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all mt-6 shadow-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log Out</span>
                  </motion.button>
                </form>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
