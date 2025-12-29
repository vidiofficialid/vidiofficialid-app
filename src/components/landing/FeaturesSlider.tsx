'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Monitor, ChevronLeft, ChevronRight } from 'lucide-react'

const screens = [
  {
    title: 'Campaign Setup',
    description:
      'Create your testimonial campaign in seconds with our intuitive setup wizard.',
    color: 'from-amber-400 to-amber-500',
  },
  {
    title: 'Share Your Link',
    description:
      'Share a simple link with your customers via email, SMS, or social media.',
    color: 'from-cyan-400 to-cyan-500',
  },
  {
    title: 'Customer Recording',
    description:
      'Customers record video testimonials directly from their browser. No app needed.',
    color: 'from-purple-400 to-purple-500',
  },
  {
    title: 'Receive Testimonials',
    description:
      'All video testimonials arrive in your dashboard, ready to download and share.',
    color: 'from-pink-400 to-pink-500',
  },
]

export function FeaturesSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section id="features" className="py-20 px-4 bg-white scroll-mt-20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Complete{' '}
            <span className="text-cyan-500">Video Testimonial</span> Workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From setup to delivery, everything you need in one beautiful
            interface
          </p>
        </div>

        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors hidden md:block"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {screens.map((screen, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4"
                >
                  <div className="bg-white rounded-3xl border-4 border-gray-900 shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                    {/* Phone Frame Header */}
                    <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <Monitor className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Screen Content */}
                    <div
                      className={`bg-gradient-to-br ${screen.color} p-8 aspect-[3/4]`}
                    >
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center">
                        <div className="bg-white/40 w-20 h-20 rounded-2xl mb-4" />
                        <div className="space-y-2">
                          <div className="h-4 bg-white/40 rounded-full w-3/4 mx-auto" />
                          <div className="h-4 bg-white/40 rounded-full w-1/2 mx-auto" />
                        </div>
                      </div>
                    </div>

                    {/* Screen Info */}
                    <div className="bg-white p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {screen.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{screen.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors hidden md:block"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-gray-900' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
