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

        // First get businesses
        const { data: businesses, error, count } = await adminClient
            .from('businesses')
            .select('*', { count: 'exact' })
            .order('name', { ascending: sortAsc })
            .range(start, end)

        if (error) {
            console.error('Error fetching businesses:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get user emails for each business
        if (businesses && businesses.length > 0) {
            const businessList = businesses as any[]
            const userIds = [...new Set(businessList.map(b => b.user_id))]

            const { data: profiles } = await adminClient
                .from('profiles')
                .select('id, name, email')
                .in('id', userIds)

            // Map profiles to businesses
            const profileMap = new Map((profiles as any[])?.map(p => [p.id, p]) || [])

            const businessesWithProfiles = businessList.map(b => ({
                ...b,
                profiles: profileMap.get(b.user_id) || null
            }))

            return NextResponse.json({ data: businessesWithProfiles, count })
        }

        return NextResponse.json({ data: businesses, count })
    } catch (error) {
        console.error('Error in businesses API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
