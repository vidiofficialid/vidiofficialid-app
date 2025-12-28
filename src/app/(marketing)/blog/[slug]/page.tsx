import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  })
  return post
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: `${post.title} | VidiOfficialID Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#FDC435] py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/logo.svg" alt="vidiofficial" width={60} height={60} />
          </Link>
          <Link href="/login">
            <button className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Blog
        </Link>

        {/* Featured Image */}
        <div className="rounded-[24px] overflow-hidden mb-8">
          <Image
            src={post.image}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <p className="text-gray-500 mb-8">
          {post.publishedAt?.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </article>

        {/* CTA */}
        <div className="mt-12 p-8 bg-[#FDC435] rounded-[24px] text-center">
          <h3 className="text-2xl font-bold text-black mb-4">
            Siap mengumpulkan video testimonial?
          </h3>
          <p className="text-black/80 mb-6">
            Mulai gratis dan lihat bagaimana video testimonial dapat mengembangkan bisnis Anda.
          </p>
          <Link href="/register">
            <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800">
              Start for Free
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
