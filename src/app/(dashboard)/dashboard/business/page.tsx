import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateBusinessContent } from './CreateBusinessContent'
import type { Business } from '@/types/database'

export default async function CreateBusinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get existing businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <CreateBusinessContent
      userId={user.id}
      existingBusinesses={(businesses as Business[]) || []}
    />
  )
}
