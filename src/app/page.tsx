import { createClient } from '@/lib/supabase/server'
import {
  Navbar,
  HeroSection,
  FeaturesSlider,
  VideoTestimonialSlider,
  HowItWorksSection,
  BlogPreviewSection,
  Footer,
} from '@/components/landing'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch latest blog posts for the preview section
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSlider />
        <VideoTestimonialSlider />
        <HowItWorksSection />
        <BlogPreviewSection posts={blogPosts || undefined} />
      </main>
      <Footer />
    </div>
  )
}
