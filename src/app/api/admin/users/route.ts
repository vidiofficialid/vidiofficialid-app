import { NextRequest, NextResponse } from 'next/server'
import { createSimpleAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        // Use simple admin client (bypasses RLS, no cookies needed)
        const adminClient = createSimpleAdminClient()

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const sortAsc = searchParams.get('sort') === 'asc'
        const limit = 10
        const start = (page - 1) * limit
        const end = start + limit - 1

        const { data, error, count } = await adminClient
            .from('profiles')
            .select('*', { count: 'exact' })
            .order('name', { ascending: sortAsc, nullsFirst: false })
            .range(start, end)

        if (error) {
            console.error('Error fetching users:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data, count })
    } catch (error) {
        console.error('Error in users API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
