'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BlogPost } from '@/types/database'

// Default blog posts for when no posts are available from database
const defaultBlogPosts = [
  {
    id: '1',
    title: '10 Marketing Tips for Small Businesses',
    excerpt:
      'Discover proven strategies to boost your business visibility and attract more customers on a budget.',
    image:
      'https://images.unsplash.com/photo-1675119711588-ecd395253cec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    slug: 'marketing-tips-small-businesses',
    category: 'Marketing',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: 'Building Customer Trust in 2024',
    excerpt:
      'Learn how authentic testimonials and transparency can transform your customer relationships.',
    image:
      'https://images.unsplash.com/photo-1696861270495-7f35c35c3273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    slug: 'building-customer-trust-2024',
    category: 'Trust',
    readTime: '7 min read',
  },
  {
    id: '3',
    title: 'The Power of Video Testimonials',
    excerpt:
      'Why video testimonials convert 80% better than text reviews and how to collect them easily.',
    image:
      'https://images.unsplash.com/photo-1697649272441-be6e4a563e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    slug: 'power-video-testimonials',
    category: 'Strategy',
    readTime: '6 min read',
  },
  {
    id: '4',
    title: 'Social Proof That Sells',
    excerpt:
      'How to leverage customer stories to increase conversions and grow your business faster.',
    image:
      'https://images.unsplash.com/photo-1752118464988-2914fb27d0f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    slug: 'social-proof-that-sells',
    category: 'Growth',
    readTime: '4 min read',
  },
]

interface BlogPreviewSectionProps {
  posts?: BlogPost[]
}

export function BlogPreviewSection({ posts }: BlogPreviewSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
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

  // Use database posts if available, otherwise use default posts
  const blogPosts =
    posts && posts.length > 0
      ? posts.map((post) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          image: post.image || defaultBlogPosts[0].image,
          slug: post.slug,
          category: 'Blog',
          readTime: '5 min read',
        }))
      : defaultBlogPosts

  return (
    <section className="py-20 px-4 bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Learn & <span className="text-amber-400">Grow</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tips, insights, and strategies to help your business thrive
          </p>
        </div>

        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white text-gray-900 shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors hidden md:block"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {blogPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4"
                >
                  <div className="bg-gray-800 rounded-3xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-gray-700 hover:border-amber-400">
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="text-sm text-gray-400 mb-3">
                        {post.readTime}
                      </div>
                      <h3 className="text-xl font-bold mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2 group"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white text-gray-900 shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors hidden md:block"
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
                index === selectedIndex ? 'bg-amber-400' : 'bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button className="bg-white text-gray-900 px-8 py-4 h-auto hover:bg-gray-100 shadow-lg">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
