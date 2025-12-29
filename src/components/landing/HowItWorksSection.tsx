import Link from 'next/link'
import { Settings, Share2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: Settings,
    title: 'Setup',
    description:
      'Create a testimonial campaign with custom questions and branding in minutes.',
    color: 'bg-amber-400',
    borderColor: 'border-amber-400',
  },
  {
    icon: Share2,
    title: 'Send',
    description:
      'Share your unique link with customers via email, text, or social media.',
    color: 'bg-cyan-400',
    borderColor: 'border-cyan-400',
  },
  {
    icon: Video,
    title: 'Get',
    description:
      'Receive authentic video testimonials instantly in your dashboard.',
    color: 'bg-purple-400',
    borderColor: 'border-purple-400',
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white scroll-mt-20"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It <span className="text-amber-400">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in three simple steps. No technical skills required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative group">
                {/* Connector Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-300 z-0" />
                )}

                <div className="relative z-10 bg-white rounded-3xl p-8 shadow-lg border-4 border-gray-900 transform group-hover:-translate-y-2 transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold">{index + 1}</span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`${step.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto border-4 ${step.borderColor} shadow-lg`}
                  >
                    <Icon className="w-10 h-10 text-gray-900" />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link href="/register">
            <Button className="bg-gray-900 text-white px-10 py-5 h-auto text-lg hover:bg-gray-800 shadow-lg hover:shadow-xl">
              Start Collecting Testimonials
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
