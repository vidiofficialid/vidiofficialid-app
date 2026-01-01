import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileContent } from './EditProfileContent'
import type { Profile } from '@/types/database'

export default async function EditProfilePage() {
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

  return <EditProfileContent profile={profile as unknown as Profile} />
}
