"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const blogPosts = [
  {
    id: 1,
    slug: "5-ways-video-testimonials-boost-conversions",
    title: "5 Ways Video Testimonials Boost Conversions",
    excerpt: "Discover how authentic customer stories can transform your marketing strategy and increase conversion rates by up to 80%.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    slug: "psychology-behind-video-testimonials",
    title: "The Psychology Behind Video Testimonials",
    excerpt: "Learn why video testimonials create deeper emotional connections with potential customers than traditional text reviews.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    slug: "getting-started-customer-video-stories",
    title: "Getting Started with Customer Video Stories",
    excerpt: "A step-by-step guide to collecting your first video testimonials and integrating them into your marketing funnel.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    slug: "best-practices-video-testimonials",
    title: "Best Practices for Video Testimonials",
    excerpt: "Expert tips on how to ask for testimonials, what questions to prompt, and how to make customers comfortable on camera.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop"
  },
  {
    id: 5,
    slug: "roi-video-testimonials-small-business",
    title: "ROI of Video Testimonials for Small Business",
    excerpt: "See real numbers: how small businesses are seeing 3x returns on investment by incorporating video testimonials.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
  },
  {
    id: 6,
    slug: "success-stories-real-businesses",
    title: "Success Stories: Real Businesses, Real Results",
    excerpt: "Read case studies from businesses that transformed their customer acquisition using authentic video testimonials.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function BlogGrid() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
            Our latest blog posts
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Helpful content to help you grow your business
          </p>
        </motion.div>

        {/* Blog Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {blogPosts.map((post) => (
            <motion.article 
              key={post.id}
              variants={cardVariants}
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group h-full">
                  {/* Image */}
                  <div className="h-48 md:h-52 overflow-hidden">
                    <Image 
                      src={post.image} 
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 text-black group-hover:text-gray-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
