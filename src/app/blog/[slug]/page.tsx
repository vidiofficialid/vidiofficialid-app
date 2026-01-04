import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Navbar, Footer } from '@/components/landing'
import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/types/database'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  const post = data as BlogPost | null

  if (!post) {
    return {
      title: 'Post Not Found - VidiOfficial',
    }
  }

  // Use meta_description if available, fallback to excerpt
  const description = post.meta_description || post.excerpt || undefined

  // Build keywords array from focus_keyword
  const keywords = post.focus_keyword
    ? [post.focus_keyword, 'video testimonial', 'UMKM Indonesia', 'VidiOfficialID']
    : ['video testimonial', 'UMKM Indonesia', 'VidiOfficialID']

  return {
    title: `${post.title} - VidiOfficial Blog`,
    description,
    keywords,
    openGraph: {
      title: post.title,
      description,
      images: post.image ? [post.image] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  }
}

interface PostWithProfile extends BlogPost {
  profiles?: { name: string | null } | null
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('*, profiles(name)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  const post = data as PostWithProfile | null

  if (!post) {
    notFound()
  }

  // Parse markdown content (basic)
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Headers
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">
              {paragraph.replace('### ', '')}
            </h3>
          )
        }
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              {paragraph.replace('## ', '')}
            </h2>
          )
        }
        if (paragraph.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold text-gray-900 mt-12 mb-6">
              {paragraph.replace('# ', '')}
            </h1>
          )
        }

        // Regular paragraph
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        )
      })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Back Button */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto max-w-4xl px-4 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article */}
        <article className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {new Date(post.published_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                )}
                {post.profiles?.name && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {post.profiles.name}
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-10">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {post.content ? formatContent(post.content) : (
                <p className="text-gray-700">No content available.</p>
              )}
            </div>

            {/* Share */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Share this article
              </h3>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(
                    `https://vidi.official.id/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors"
                >
                  <span className="sr-only">Share on Twitter</span>
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                    `https://vidi.official.id/blog/${post.slug}`
                  )}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors"
                >
                  <span className="sr-only">Share on LinkedIn</span>
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${post.title} - https://vidi.official.id/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors"
                >
                  <span className="sr-only">Share on WhatsApp</span>
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
