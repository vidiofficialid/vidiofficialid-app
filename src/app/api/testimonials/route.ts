import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received testimonial data:', JSON.stringify(body, null, 2))
    
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

    // Use service role if available, otherwise use anon key
    const apiKey = supabaseServiceKey || supabaseAnonKey
    console.log('Using key type:', supabaseServiceKey ? 'service_role' : 'anon')
    
    const supabase = createClient(supabaseUrl, apiKey)

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

    console.log('Inserting testimonial:', JSON.stringify(testimonialData, null, 2))

    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonialData)
      .select()
      .single()

    if (error) {
      console.error('Database error details:', JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to save testimonial',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Testimonial saved successfully:', data?.id)

    // Update campaign status to RECORDED
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'RECORDED' })
      .eq('id', campaign_id)

    if (updateError) {
      console.error('Campaign update error:', updateError.message)
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
