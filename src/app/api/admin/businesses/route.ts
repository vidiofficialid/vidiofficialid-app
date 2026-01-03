import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify user is authenticated and has editor/admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'editor'].includes((profile as any).role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const sortAsc = searchParams.get('sort') === 'asc'
        const limit = 10
        const start = (page - 1) * limit
        const end = start + limit - 1

        // Use admin client for data access (bypasses RLS)
        const { createAdminClient } = await import('@/lib/supabase/server')
        const adminClient = await createAdminClient()

        const { data, error, count } = await adminClient
            .from('businesses')
            .select('*, profiles!businesses_user_id_fkey(name, email)', { count: 'exact' })
            .order('name', { ascending: sortAsc })
            .range(start, end)

        if (error) {
            console.error('Error fetching businesses:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data, count })
    } catch (error) {
        console.error('Error in businesses API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
