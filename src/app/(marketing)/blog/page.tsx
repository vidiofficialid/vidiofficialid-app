import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

async function getBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  })
  return posts
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

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
      <main className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-black mb-4">
          Blog
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Helpful content to help you grow your business
        </p>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full">
                <div className="h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-3 text-black group-hover:text-gray-700 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
