import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './DashboardContent'
import type { Profile, Business, Campaign, Testimonial } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get business count
  const { count: businessCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get businesses for campaign count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id) as { data: { id: string }[] | null }

  const businessIds = businesses?.map(b => b.id) || []

  // Get campaign count
  let campaignCount = 0
  if (businessIds.length > 0) {
    const { count } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .in('business_id', businessIds)
    campaignCount = count || 0
  }

  // Get campaigns for testimonial count
  let testimonialCount = 0
  if (businessIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id')
      .in('business_id', businessIds) as { data: { id: string }[] | null }

    const campaignIds = campaigns?.map(c => c.id) || []
    
    if (campaignIds.length > 0) {
      const { count } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
      testimonialCount = count || 0
    }
  }

  return (
    <DashboardContent
      profile={profile as unknown as Profile}
      businessCount={businessCount || 0}
      campaignCount={campaignCount}
      testimonialCount={testimonialCount}
    />
  )
}
