import { 
  Hero, 
  MockupCarousel, 
  ContentSection, 
  ProcessSection, 
  BlogGrid, 
  Footer 
} from "@/components/landing"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <MockupCarousel />
      <ContentSection />
      <ProcessSection />
      <BlogGrid />
      <Footer />
    </main>
  )
}
