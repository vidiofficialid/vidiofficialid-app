import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditAccountContent } from './EditAccountContent'
import type { Profile } from '@/types/database'

export default async function EditAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <EditAccountContent profile={profile as unknown as Profile} userEmail={user.email || ''} />
}
