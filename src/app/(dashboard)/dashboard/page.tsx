import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import type { Profile } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = data as Profile | null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">VidiOfficialID</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{profile?.name || user.email}</span>
            <form action={signOut}>
              <Button variant="outline" size="sm">Keluar</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Selamat Datang! 👋</h2>
          <p className="text-gray-600 mb-6">
            Kamu berhasil login sebagai <strong>{user.email}</strong>
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Role</h3>
              <p className="text-2xl font-bold capitalize">{profile?.role || 'user'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Provider</h3>
              <p className="text-2xl font-bold capitalize">{profile?.auth_provider || 'email'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Email Verified</h3>
              <p className="text-2xl font-bold">{profile?.email_verified ? '✅ Ya' : '❌ Belum'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
