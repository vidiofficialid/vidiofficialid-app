import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for logging (no RLS restrictions)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            campaign_id,
            stage,
            event_type,
            error_message,
            error_stack,
            device_info,
            video_dimensions,
            browser_info,
            additional_data
        } = body

        const { error } = await supabaseAdmin
            .from('recording_logs')
            .insert({
                campaign_id,
                stage, // 'camera_init' | 'recording' | 'preview' | 'upload'
                event_type, // 'info' | 'warning' | 'error'
                error_message,
                error_stack,
                device_info,
                video_dimensions,
                browser_info,
                additional_data,
                created_at: new Date().toISOString()
            })

        if (error) {
            console.error('Failed to log recording event:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Recording log API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
