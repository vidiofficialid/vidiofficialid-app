import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received testimonial data:', body)
    
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
        { error: 'Missing required fields: campaign_id and video_url are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Prepare testimonial data
    const testimonialData = {
      campaign_id,
      video_url,
      status: 'PENDING',
      recorded_at: new Date().toISOString(),
      duration: duration ? Math.round(duration) : null,
      device_info: JSON.stringify({
        customer_name: customer_name || 'Anonymous',
        product_rating: product_rating || 0,
        app_rating: app_rating || 0,
      }),
    }

    console.log('Inserting testimonial:', testimonialData)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .insert(testimonialData)
      .select()
      .single()

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        { 
          error: 'Failed to save testimonial',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      )
    }

    console.log('Testimonial saved successfully:', data)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('campaigns')
      .update({ status: 'RECORDED' })
      .eq('id', campaign_id)

    if (updateError) {
      console.error('Campaign update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      testimonial: data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
