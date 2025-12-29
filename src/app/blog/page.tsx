import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar } from 'lucide-react'
import { Navbar, Footer } from '@/components/landing'
import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/types/database'

export const metadata: Metadata = {
  title: 'Blog - VidiOfficial',
  description:
    'Tips, insights, and strategies to help your business thrive with video testimonials.',
}

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const posts = (data || []) as BlogPost[]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 via-white to-cyan-50 py-20 px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
              Our <span className="text-amber-400">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tips, insights, and strategies to help your business thrive with
              video testimonials
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 hover:border-amber-400 transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Image */}
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative aspect-video overflow-hidden">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-300 flex items-center justify-center">
                            <span className="text-gray-900 text-4xl font-bold">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6">
                      {post.published_at && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.published_at).toLocaleDateString(
                            'id-ID',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </div>
                      )}
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-amber-600 transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium group"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Posts Yet
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're working on some great content. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
