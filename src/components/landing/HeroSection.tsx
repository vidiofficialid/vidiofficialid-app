'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analytics } from '@/components/analytics/GoogleAnalytics'

export function HeroSection() {
  // Track CTA clicks
  const handleGetStartedClick = () => {
    analytics.trackCTAClick('get_started', 'hero_section')
    analytics.trackSignupClick('hero_section')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-cyan-50 py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <Image
                src="/logo.svg"
                alt="VidiOfficial"
                width={200}
                height={96}
                className="h-24 w-auto"
                priority
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl tracking-tight text-gray-900">
                Collect Video{' '}
                <span className="text-amber-400">Testimonials</span>{' '}
                Effortlessly
              </h1>
              <p className="text-xl text-gray-600 max-w-xl">
                The simple web app that helps small businesses gather authentic
                video testimonials from happy customers in minutes.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/register" onClick={handleGetStartedClick}>
                <Button className="group bg-gray-900 text-white px-8 py-4 h-auto hover:bg-gray-800 shadow-lg hover:shadow-xl">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="bg-white text-gray-900 px-8 py-4 h-auto hover:bg-gray-50 shadow-md hover:shadow-lg border-2 border-gray-200"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Happy Businesses</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-3xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">Testimonials Collected</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-amber-400 to-amber-300 rounded-[3rem] p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-white rounded-3xl p-6 shadow-lg -rotate-3">
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-2" />
                      <div className="h-2 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
