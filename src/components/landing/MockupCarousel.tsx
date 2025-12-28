"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const mockupImages = [
  { id: 1, alt: "Video testimonial app screen 1" },
  { id: 2, alt: "Video testimonial app screen 2" },
  { id: 3, alt: "Video testimonial app screen 3" },
]

export function MockupCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "center",
    skipSnaps: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return
    const autoplay = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)
    return () => clearInterval(autoplay)
  }, [emblaApi])

  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {/* Previous Button */}
          <button
            onClick={scrollPrev}
            className="p-2 md:p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Previous mockup"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden max-w-4xl" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {mockupImages.map((mockup, index) => (
                <div
                  key={mockup.id}
                  className={`flex-[0_0_200px] md:flex-[0_0_240px] lg:flex-[0_0_280px] transition-all duration-300 ${
                    index === selectedIndex ? "scale-105" : "scale-95 opacity-70"
                  }`}
                >
                  <div 
                    className="bg-gradient-to-b from-purple-100 via-purple-50 to-orange-50 rounded-[40px] p-3 md:p-4 shadow-lg h-[400px] md:h-[480px] lg:h-[520px] flex items-center justify-center overflow-hidden"
                  >
                    {/* Phone Frame */}
                    <div className="relative w-full h-full bg-white rounded-[32px] overflow-hidden shadow-inner">
                      {/* Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
                      
                      {/* Screen Content */}
                      <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200" />
                          <p className="text-sm">Video Preview</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={scrollNext}
            className="p-2 md:p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Next mockup"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {mockupImages.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? "bg-[#FDC435] w-6" 
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
