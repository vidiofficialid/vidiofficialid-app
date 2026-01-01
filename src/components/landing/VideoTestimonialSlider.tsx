'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Video {
  id: string
  url: string
  title: string
}

interface VideoSliderContent {
  videos: Video[]
}

export function VideoTestimonialSlider() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchVideos() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section_name', 'video_slider')
        .single()

      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = (data as any).content as VideoSliderContent
        if (content?.videos && content.videos.length > 0) {
          setVideos(content.videos)
        }
      }
      setIsLoading(false)
    }

    fetchVideos()
  }, [])

  useEffect(() => {
    // Auto-advance carousel every 10 seconds if not playing
    if (!isPlaying && videos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % videos.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, videos.length])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)
    setIsPlaying(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Stories from Real Customers
            </h2>
            <p className="text-xl text-gray-600">
              See what business owners are saying about VidiOfficialID
            </p>
          </div>
          <div className="flex justify-center items-center h-96">
            <div className="animate-pulse bg-gray-200 rounded-2xl w-full max-w-4xl h-full" />
          </div>
        </div>
      </section>
    )
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real Stories from Real Customers
          </h2>
          <p className="text-xl text-gray-600">
            See what business owners are saying about VidiOfficialID
          </p>
        </motion.div>

        {/* Video Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video"
            >
              {/* Video */}
              <video
                ref={videoRef}
                src={videos[currentIndex]?.url}
                className="w-full h-full object-cover"
                playsInline
                muted={isMuted}
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
              />

              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-xl font-semibold">
                  {videos[currentIndex]?.title}
                </h3>
              </div>

              {/* Play/Pause Overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: isPlaying ? 0 : 1 }}
                  className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-gray-900" />
                  ) : (
                    <Play className="w-8 h-8 text-gray-900 ml-1" />
                  )}
                </motion.div>
              </button>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {videos.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-900" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {videos.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsPlaying(false)
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-amber-400 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
