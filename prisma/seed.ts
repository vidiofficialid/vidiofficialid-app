import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Blog Posts
  const blogPosts = [
    {
      title: "5 Ways Video Testimonials Boost Conversions",
      slug: "5-ways-video-testimonials-boost-conversions",
      excerpt: "Discover how authentic customer stories can transform your marketing strategy and increase conversion rates by up to 80%.",
      content: `Video testimonials are one of the most powerful tools in modern marketing. Here are 5 ways they can boost your conversions:

1. **Build Trust Instantly** - Seeing real customers share their experiences creates immediate credibility.

2. **Emotional Connection** - Video captures emotion in ways text simply cannot.

3. **Social Proof** - When prospects see others succeeding with your product, they want the same results.

4. **Higher Engagement** - Video content is consumed 1200% more than text and images combined.

5. **Better SEO** - Video content keeps visitors on your site longer, improving search rankings.

Start collecting video testimonials today and watch your conversion rates soar!`,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      published: true,
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: "The Psychology Behind Video Testimonials",
      slug: "psychology-behind-video-testimonials",
      excerpt: "Learn why video testimonials create deeper emotional connections with potential customers than traditional text reviews.",
      content: `Understanding the psychology behind video testimonials can help you leverage them more effectively.

**The Science of Trust**
Our brains are wired to trust faces. When we see a real person speaking, mirror neurons activate, creating empathy and connection.

**Authenticity Signals**
Micro-expressions, tone of voice, and body language all communicate authenticity in ways that text cannot replicate.

**The Mere Exposure Effect**
Seeing multiple testimonials creates familiarity with your brand, increasing trust over time.

**Social Proof in Action**
Humans are social creatures. We look to others' experiences to guide our decisions, especially for purchases.

Use these psychological principles to create more compelling testimonial campaigns!`,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
      published: true,
      publishedAt: new Date('2025-01-10'),
    },
    {
      title: "Getting Started with Customer Video Stories",
      slug: "getting-started-customer-video-stories",
      excerpt: "A step-by-step guide to collecting your first video testimonials and integrating them into your marketing funnel.",
      content: `Ready to start collecting video testimonials? Here's your complete guide:

**Step 1: Identify Happy Customers**
Look for customers who have expressed satisfaction through reviews, support tickets, or social media.

**Step 2: Make the Ask**
Reach out personally and explain why their story matters. Most happy customers are willing to help!

**Step 3: Keep It Simple**
Use a platform like vidiofficialid to make recording easy. No apps to download, no complicated setup.

**Step 4: Provide Guidance**
Give customers prompts like "What problem were you facing?" and "How did our product help?"

**Step 5: Integrate Everywhere**
Add testimonials to your homepage, product pages, email campaigns, and social media.

Start small with 3-5 testimonials and grow your library over time!`,
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
      published: true,
      publishedAt: new Date('2025-01-05'),
    },
    {
      title: "Best Practices for Video Testimonials",
      slug: "best-practices-video-testimonials",
      excerpt: "Expert tips on how to ask for testimonials, what questions to prompt, and how to make customers comfortable on camera.",
      content: `Follow these best practices to get the most impactful video testimonials:

**Timing is Everything**
Ask for testimonials when customers are happiest - right after a successful outcome or positive interaction.

**The Right Questions**
- What was your situation before using our product?
- What made you choose us?
- What results have you achieved?
- What would you tell someone considering our product?

**Technical Tips**
- Good lighting (face a window)
- Quiet environment
- Horizontal orientation
- 60-90 seconds is ideal

**Make Them Comfortable**
- Let them know it doesn't need to be perfect
- They can re-record if needed
- Share examples of other testimonials

**Follow Up**
Thank customers and show them how their testimonial is being used!`,
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
      published: true,
      publishedAt: new Date('2024-12-28'),
    },
    {
      title: "ROI of Video Testimonials for Small Business",
      slug: "roi-video-testimonials-small-business",
      excerpt: "See real numbers: how small businesses are seeing 3x returns on investment by incorporating video testimonials.",
      content: `Let's talk numbers. Here's the real ROI of video testimonials:

**The Statistics**
- 92% of consumers read reviews before purchasing
- Video testimonials increase conversion by 80%
- Landing pages with video convert 86% better

**Cost Analysis**
Traditional video production: $2,000-10,000 per video
DIY with vidiofficialid: $0-50 per video

**Real Business Results**
Small businesses using video testimonials report:
- 3x increase in qualified leads
- 50% reduction in sales cycle length
- 25% increase in average order value

**Calculating Your ROI**
If each new customer is worth $500 and testimonials bring 10 more customers per month, that's $5,000 in new revenue.

The math is clear: video testimonials are one of the highest-ROI marketing investments you can make!`,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
      published: true,
      publishedAt: new Date('2024-12-20'),
    },
    {
      title: "Success Stories: Real Businesses, Real Results",
      slug: "success-stories-real-businesses",
      excerpt: "Read case studies from businesses that transformed their customer acquisition using authentic video testimonials.",
      content: `Here are real success stories from businesses using video testimonials:

**Case Study 1: Local Gym**
Challenge: Struggling to differentiate from big box gyms
Solution: Collected 20 member transformation stories
Result: 150% increase in new memberships

**Case Study 2: SaaS Startup**
Challenge: Building trust as a new company
Solution: Featured customer testimonials on every page
Result: Doubled trial-to-paid conversion rate

**Case Study 3: E-commerce Store**
Challenge: High cart abandonment rate
Solution: Added video reviews to product pages
Result: 35% reduction in cart abandonment

**Case Study 4: Consulting Firm**
Challenge: Long sales cycles
Solution: Sent testimonial videos to prospects
Result: Cut average sales cycle from 6 weeks to 2 weeks

Your success story could be next! Start collecting testimonials today.`,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
      published: true,
      publishedAt: new Date('2024-12-15'),
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    })
    console.log(`✅ Created/Updated: ${post.title}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
