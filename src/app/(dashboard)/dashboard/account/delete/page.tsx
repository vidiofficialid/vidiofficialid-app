import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeleteAccountContent } from './DeleteAccountContent'
import type { Profile } from '@/types/database'

export default async function DeleteAccountPage() {
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

  return <DeleteAccountContent profile={profile as unknown as Profile} userEmail={user.email || ''} />
}
