'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Smartphone, Tablet, Info, Video, Star, ChevronRight } from 'lucide-react'
import { RecordSection } from '@/components/record/RecordSection'
import { RateSection } from '@/components/record/RateSection'
import type { Campaign, Business } from '@/types/database'

interface RecordPageContentProps {
  campaign: Campaign
  business: Business
}

type PageStep = 'about' | 'record' | 'rate'

export function RecordPageContent({ campaign, business }: RecordPageContentProps) {
  const [currentStep, setCurrentStep] = useState<PageStep>('about')
  const [selectedDevice, setSelectedDevice] = useState('')
  const [selectedOS, setSelectedOS] = useState('')
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)

  const handleDeviceSelect = (device: string) => {
    setSelectedDevice(device)
    setSelectedOS('')
  }

  const handleOSSelect = (os: string) => {
    setSelectedOS(os)
  }

  const handleContinueToRecord = () => {
    if (selectedDevice && selectedOS) {
      setCurrentStep('record')
    }
  }

  const handleRecordingComplete = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob)
    setCurrentStep('rate')
  }

  const getOSOptions = () => {
    if (selectedDevice === 'computer') {
      return ['Windows', 'macOS', 'Linux']
    } else if (selectedDevice === 'tablet' || selectedDevice === 'smartphone') {
      return ['iOS', 'Android']
    }
    return []
  }

  const devices = [
    { id: 'computer', label: 'Komputer/Laptop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'smartphone', label: 'Smartphone', icon: Smartphone },
  ]

  // Bottom Navigation items
  const navItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'record', label: 'Record', icon: Video },
    { id: 'rate', label: 'Rate', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dsv8iy2la/image/upload/v1766922503/logo_k0q2cc.png"
            alt="VidiOfficialID"
            width={48}
            height={48}
            className="w-12 h-12"
          />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* About Page */}
        {currentStep === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-md mx-auto px-4 py-6"
          >
            {/* Campaign Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-5">
                {/* Business & Campaign Header */}
                <div className="flex items-center gap-3 mb-4">
                  {business?.logo ? (
                    <Image
                      src={business.logo}
                      alt={business?.name || 'Business'}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
                      {business?.name?.[0]?.toUpperCase() || 'B'}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">{business?.name || 'Business'}</h2>
                    <p className="text-gray-600 text-sm">{campaign.title}</p>
                  </div>
                </div>

                {/* Campaign Image */}
                {campaign.product_image && (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4">
                    <Image
                      src={campaign.product_image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed">
                  Kami sangat menghargai pendapat Anda! Bagikan pengalaman Anda menggunakan 
                  produk/layanan kami dalam bentuk video testimonial. Video Anda akan membantu 
                  calon pelanggan lain membuat keputusan yang tepat.
                </p>
              </div>
            </motion.div>

            {/* Device Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              <h3 className="text-gray-900 font-semibold mb-4">Pilih Perangkat Anda</h3>
              <div className="space-y-3">
                {devices.map((device) => {
                  const Icon = device.icon
                  const isSelected = selectedDevice === device.id
                  return (
                    <motion.button
                      key={device.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeviceSelect(device.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={24}
                          className={isSelected ? 'text-orange-600' : 'text-gray-500'}
                        />
                        <span className={isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}>
                          {device.label}
                        </span>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className={isSelected ? 'text-orange-600' : 'text-gray-400'} 
                      />
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* OS Selection */}
            <AnimatePresence>
              {selectedDevice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <h3 className="text-gray-900 font-semibold mb-4">Pilih Sistem Operasi</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {getOSOptions().map((os) => (
                      <motion.button
                        key={os}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOSSelect(os)}
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          selectedOS === os
                            ? 'border-orange-500 bg-orange-50 text-orange-600 font-medium'
                            : 'border-gray-200 bg-white hover:border-orange-300 text-gray-700'
                        }`}
                      >
                        {os}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Button */}
            <AnimatePresence>
              {selectedDevice && selectedOS && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueToRecord}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Lanjutkan ke Perekaman
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Record Section */}
        {currentStep === 'record' && (
          <motion.div
            key="record"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RecordSection
              campaignData={{
                transcript: campaign.testimonial_script || 'Ceritakan pengalaman Anda dengan produk/layanan kami...',
                gestureGuide: campaign.gesture_guide || '',
              }}
              onRecordingComplete={handleRecordingComplete}
              deviceInfo={{ device: selectedDevice, os: selectedOS }}
            />
          </motion.div>
        )}

        {/* Rate Section */}
        {currentStep === 'rate' && (
          <motion.div
            key="rate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RateSection
              campaign={campaign}
              business={business}
              recordedVideo={recordedVideo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentStep === item.id
              const isAccessible = 
                item.id === 'about' || 
                (item.id === 'record' && selectedDevice && selectedOS) ||
                (item.id === 'rate' && recordedVideo)

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAccessible) {
                      setCurrentStep(item.id as PageStep)
                    }
                  }}
                  disabled={!isAccessible}
                  className={`flex flex-col items-center py-2 px-6 rounded-lg transition-all ${
                    isActive 
                      ? 'text-orange-600' 
                      : isAccessible 
                        ? 'text-gray-500 hover:text-gray-700' 
                        : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Icon size={24} className={isActive ? 'text-orange-600' : ''} />
                  <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
