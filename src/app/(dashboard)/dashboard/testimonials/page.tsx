import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialsContent } from './TestimonialsContent'
import type { Business, Campaign, Testimonial } from '@/types/database'

interface TestimonialWithCampaign extends Testimonial {
  campaign?: Campaign & { business?: Business }
}

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const businessIds = (businesses as any[])?.map((b: { id: string }) => b.id) || []

  // Get campaigns and testimonials
  let testimonials: TestimonialWithCampaign[] = []
  
  if (businessIds.length > 0) {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .in('business_id', businessIds)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaignIds = (campaigns as any[])?.map((c: { id: string }) => c.id) || []

    if (campaignIds.length > 0) {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false })

      // Map testimonials with campaign and business info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testimonials = ((data as any[]) || []).map((t: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const campaign = (campaigns as any[])?.find((c: any) => c.id === t.campaign_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const business = (businesses as any[])?.find((b: any) => b.id === campaign?.business_id)
        return {
          ...t,
          campaign: campaign ? { ...campaign, business } : undefined
        }
      }) as TestimonialWithCampaign[]
    }
  }

  return (
    <TestimonialsContent
      testimonials={testimonials}
      businesses={(businesses as Business[]) || []}
    />
  )
}
