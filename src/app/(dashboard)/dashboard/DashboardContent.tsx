'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Building2, Megaphone, MessageSquare } from 'lucide-react'
import type { Profile } from '@/types/database'

interface DashboardContentProps {
  profile: Profile
  businessCount: number
  campaignCount: number
  testimonialCount: number
}

export function DashboardContent({
  profile,
  businessCount,
  campaignCount,
  testimonialCount,
}: DashboardContentProps) {
  const stats = [
    {
      icon: Building2,
      label: 'Bisnis Dibuat',
      value: businessCount,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/dashboard/business',
    },
    {
      icon: Megaphone,
      label: 'Campaign Dibuat',
      value: campaignCount,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/dashboard/campaign',
    },
    {
      icon: MessageSquare,
      label: 'Testimonial',
      value: testimonialCount,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-orange-600',
      href: '/dashboard/testimonials',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
        <div className="relative">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            Selamat Datang! 👋
          </motion.h1>
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-orange-100"
          >
            Mari kelola bisnis Anda dengan mudah
          </motion.p>
        </div>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi Pengguna
        </h2>

        <div className="flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name || 'Avatar'}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-4 border-orange-100 shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-gray-500">Nama Lengkap</p>
              <p className="font-semibold text-gray-800">
                {profile?.name || 'Belum diisi'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="font-medium text-sm text-gray-700">
                  {profile?.email}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full text-xs font-medium capitalize">
                {profile?.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Info */}
        {profile?.whatsapp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4 border-t border-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">WhatsApp</p>
                <p className="font-medium text-sm text-gray-800">
                  {profile.whatsapp}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.1,
                  type: 'spring',
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-4 relative overflow-hidden cursor-pointer"
              >
                <div
                  className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full -mr-10 -mt-10 opacity-50`}
                />

                <div className="relative">
                  <div
                    className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                    {stat.label}
                  </p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      delay: 0.5 + index * 0.1,
                    }}
                    className={`text-2xl font-bold ${stat.textColor}`}
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Mulai Sekarang
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/business">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl text-center cursor-pointer border border-purple-100"
            >
              <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Buat Bisnis</p>
            </motion.div>
          </Link>
          <Link href="/dashboard/campaign">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-center cursor-pointer border border-blue-100"
            >
              <Megaphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Buat Campaign</p>
            </motion.div>
          </Link>
          <Link href="/dashboard/testimonials" className="col-span-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-100 p-4 rounded-2xl text-center cursor-pointer border border-orange-100"
            >
              <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">
                Lihat Testimonial
              </p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
