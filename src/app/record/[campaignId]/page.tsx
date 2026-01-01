import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RecordPageContent } from './RecordPageContent'
import type { Campaign, Business } from '@/types/database'

interface PageProps {
  params: Promise<{ campaignId: string }>
}

export default async function RecordPage({ params }: PageProps) {
  const { campaignId } = await params
  const supabase = await createClient()

  // Get campaign data
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (error || !campaign) {
    notFound()
  }

  // Get business data
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', (campaign as Campaign).business_id)
    .single()

  return (
    <RecordPageContent
      campaign={campaign as unknown as Campaign}
      business={business as unknown as Business}
    />
  )
}
