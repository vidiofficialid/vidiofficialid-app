import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      campaign_id,
      video_url,
      customer_name,
      product_rating,
      app_rating,
      duration,
    } = body

    if (!campaign_id || !video_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Save testimonial
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .insert({
        campaign_id,
        video_url,
        status: 'PENDING',
        recorded_at: new Date().toISOString(),
        duration: duration || null,
        device_info: JSON.stringify({
          customer_name,
          product_rating,
          app_rating,
        }),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save testimonial' },
        { status: 500 }
      )
    }

    // Update campaign status to RECORDED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('campaigns')
      .update({ status: 'RECORDED' })
      .eq('id', campaign_id)

    return NextResponse.json({
      success: true,
      testimonial: data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
