import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateCampaignContent } from './CreateCampaignContent'
import type { Business, Campaign } from '@/types/database'

export default async function CreateCampaignPage() {
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
    .order('created_at', { ascending: false })

  const businessList = (businesses as Business[]) || []
  const businessIds = businessList.map(b => b.id)

  // Get existing campaigns
  let campaigns: Campaign[] = []
  if (businessIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('campaigns')
      .select('*')
      .in('business_id', businessIds)
      .order('created_at', { ascending: false })
    campaigns = (data as Campaign[]) || []
  }

  return (
    <CreateCampaignContent
      businesses={businessList}
      existingCampaigns={campaigns}
    />
  )
}
