import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialsContent } from './TestimonialsContent'
import type { Testimonial, Campaign, Business } from '@/types/database'

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's businesses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: businesses } = await (supabase as any)
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)

  const businessList = (businesses as Business[]) || []
  const businessIds = businessList.map(b => b.id)

  // Get campaigns
  let campaigns: Campaign[] = []
  let testimonials: Testimonial[] = []

  if (businessIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: campaignsData } = await (supabase as any)
      .from('campaigns')
      .select('*')
      .in('business_id', businessIds)
    campaigns = (campaignsData as Campaign[]) || []

    const campaignIds = campaigns.map(c => c.id)

    if (campaignIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: testimonialsData } = await (supabase as any)
        .from('testimonials')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false })
      testimonials = (testimonialsData as Testimonial[]) || []
    }
  }

  return (
    <TestimonialsContent
      testimonials={testimonials}
      campaigns={campaigns}
      businesses={businessList}
    />
  )
}
