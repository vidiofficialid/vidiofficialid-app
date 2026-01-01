'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Laptop, Tablet, Smartphone, ChevronRight } from 'lucide-react'
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
    if (selectedDevice === 'computer' || selectedDevice === 'laptop') {
      return ['Windows', 'macOS', 'Linux']
    } else if (selectedDevice === 'tablet' || selectedDevice === 'smartphone') {
      return ['iOS', 'Android']
    }
    return []
  }

  const devices = [
    { id: 'computer', label: 'Komputer', icon: Monitor },
    { id: 'laptop', label: 'Laptop', icon: Laptop },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'smartphone', label: 'Smartphone', icon: Smartphone },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image
            src="https://res.cloudinary.com/dsv8iy2la/image/upload/v1766922503/logo_k0q2cc.png"
            alt="VidiOfficialID"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={currentStep === 'about' ? 'text-orange-600 font-medium' : ''}>Info</span>
            <ChevronRight className="w-4 h-4" />
            <span className={currentStep === 'record' ? 'text-orange-600 font-medium' : ''}>Rekam</span>
            <ChevronRight className="w-4 h-4" />
            <span className={currentStep === 'rate' ? 'text-orange-600 font-medium' : ''}>Selesai</span>
          </div>
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
            className="max-w-2xl mx-auto px-4 py-6"
          >
            {/* Campaign Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {business?.logo ? (
                    <Image
                      src={business.logo}
                      alt={business.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
                      {business?.name?.[0] || 'B'}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">{business?.name}</h2>
                    <p className="text-gray-600 text-sm">{campaign.title}</p>
                  </div>
                </div>

                {campaign.product_image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
                    <Image
                      src={campaign.product_image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Halo, {campaign.customer_name}!</p>
                    <p className="text-gray-700 leading-relaxed">
                      Kami sangat menghargai pendapat Anda! Mohon luangkan waktu beberapa menit
                      untuk memberikan video testimonial tentang pengalaman Anda dengan{' '}
                      <strong>{business?.name}</strong>.
                    </p>
                  </div>

                  {campaign.testimonial_script && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-orange-800 mb-2">Script yang diharapkan:</p>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{campaign.testimonial_script}</p>
                    </div>
                  )}

                  {campaign.gesture_guide && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">Petunjuk gesture:</p>
                      <p className="text-gray-700 text-sm">{campaign.gesture_guide}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Device Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              <h3 className="text-gray-900 font-medium mb-4">Pilih perangkat yang Anda gunakan:</h3>
              <div className="grid grid-cols-2 gap-3">
                {devices.map((device) => {
                  const Icon = device.icon
                  return (
                    <motion.button
                      key={device.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeviceSelect(device.id)}
                      className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                        selectedDevice === device.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <Icon
                        size={36}
                        className={selectedDevice === device.id ? 'text-orange-600' : 'text-gray-600'}
                      />
                      <span className={selectedDevice === device.id ? 'text-orange-600 font-medium' : 'text-gray-700'}>
                        {device.label}
                      </span>
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
                  <h3 className="text-gray-900 font-medium mb-4">Pilih sistem operasi:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {getOSOptions().map((os) => (
                      <motion.button
                        key={os}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOSSelect(os)}
                        className={`p-4 rounded-xl border-2 transition-all ${
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
                  className="mt-8 pb-8"
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
    </div>
  )
}
