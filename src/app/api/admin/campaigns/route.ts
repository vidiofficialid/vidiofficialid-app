import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        // Use admin client for data access (bypasses RLS)
        const adminClient = await createAdminClient()

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const sortAsc = searchParams.get('sort') === 'asc'
        const limit = 10
        const start = (page - 1) * limit
        const end = start + limit - 1

        // First get campaigns
        const { data: campaigns, error, count } = await adminClient
            .from('campaigns')
            .select('*', { count: 'exact' })
            .order('title', { ascending: sortAsc })
            .range(start, end)

        if (error) {
            console.error('Error fetching campaigns:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get business names for each campaign
        if (campaigns && campaigns.length > 0) {
            const campaignList = campaigns as any[]
            const businessIds = [...new Set(campaignList.map(c => c.business_id))]

            const { data: businessList } = await adminClient
                .from('businesses')
                .select('id, name')
                .in('id', businessIds)

            // Map businesses to campaigns
            const businessMap = new Map((businessList as any[])?.map(b => [b.id, b]) || [])

            const campaignsWithBusinesses = campaignList.map(c => ({
                ...c,
                businesses: businessMap.get(c.business_id) || null
            }))

            return NextResponse.json({ data: campaignsWithBusinesses, count })
        }

        return NextResponse.json({ data: campaigns, count })
    } catch (error) {
        console.error('Error in campaigns API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
