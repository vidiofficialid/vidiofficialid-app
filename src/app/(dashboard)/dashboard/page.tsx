import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './DashboardContent'
import type { Profile } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // Get profile
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get business count
  const { count: businessCount } = await sb
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get businesses for campaign count
  const { data: businesses } = await sb
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)

  const businessIds = (businesses as { id: string }[])?.map(b => b.id) || []

  // Get campaign count
  let campaignCount = 0
  if (businessIds.length > 0) {
    const { count } = await sb
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .in('business_id', businessIds)
    campaignCount = count || 0
  }

  // Get campaigns for testimonial count
  let testimonialCount = 0
  if (businessIds.length > 0) {
    const { data: campaigns } = await sb
      .from('campaigns')
      .select('id')
      .in('business_id', businessIds)

    const campaignIds = (campaigns as { id: string }[])?.map(c => c.id) || []
    
    if (campaignIds.length > 0) {
      const { count } = await sb
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
      testimonialCount = count || 0
    }
  }

  return (
    <DashboardContent
      profile={profile as Profile}
      businessCount={businessCount || 0}
      campaignCount={campaignCount}
      testimonialCount={testimonialCount}
    />
  )
}
