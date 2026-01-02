import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { testimonialId, action } = await request.json()

    if (!testimonialId || !action) {
      return NextResponse.json(
        { error: 'Missing testimonialId or action' },
        { status: 400 }
      )
    }

    const now = new Date()
    
    if (action === 'approve') {
      // Approve: set expires_at to 15 days from now
      const expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      
      const { error } = await supabaseAdmin
        .from('testimonials')
        .update({
          status: 'APPROVED',
          approved_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', testimonialId)

      if (error) {
        console.error('Error approving testimonial:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Testimonial approved successfully',
        expires_at: expiresAt.toISOString(),
      })
    } 
    
    if (action === 'reject') {
      // Reject: set deleted_at to 3 days from now (when video will be deleted)
      const deleteAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      
      const { error } = await supabaseAdmin
        .from('testimonials')
        .update({
          status: 'REJECTED',
          rejected_at: now.toISOString(),
          expires_at: deleteAt.toISOString(),
        })
        .eq('id', testimonialId)

      if (error) {
        console.error('Error rejecting testimonial:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Testimonial rejected. Video will be deleted in 3 days.',
        delete_at: deleteAt.toISOString(),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing testimonial action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
