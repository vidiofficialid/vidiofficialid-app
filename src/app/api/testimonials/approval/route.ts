import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Delete video from Cloudinary
async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials not configured')
      return false
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    
    // Create SHA1 signature
    const encoder = new TextEncoder()
    const data = encoder.encode(signatureString)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('signature', signature)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const result = await response.json()
    console.log('Cloudinary delete result:', result)
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

// Extract public_id from Cloudinary URL
function extractPublicId(url: string): string | null {
  try {
    // URL format: https://res.cloudinary.com/xxx/video/upload/v123/folder/filename.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testimonialId, action } = body

    if (!testimonialId || !action) {
      return NextResponse.json(
        { error: 'testimonialId and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get testimonial
    const { data: testimonial, error: fetchError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('id', testimonialId)
      .single()

    if (fetchError || !testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    if (action === 'approve') {
      // Calculate expiry date (15 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 15)

      const { error: updateError } = await supabaseAdmin
        .from('testimonials')
        .update({
          status: 'APPROVED',
          approved_at: now,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', testimonialId)

      if (updateError) {
        console.error('Error approving testimonial:', updateError)
        return NextResponse.json(
          { error: 'Failed to approve testimonial' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Testimonial approved successfully',
        expiresAt: expiresAt.toISOString(),
      })
    } else {
      // Reject: Schedule deletion in 3 days
      const deleteAt = new Date()
      deleteAt.setDate(deleteAt.getDate() + 3)

      const { error: updateError } = await supabaseAdmin
        .from('testimonials')
        .update({
          status: 'REJECTED',
          rejected_at: now,
          expires_at: deleteAt.toISOString(),
        })
        .eq('id', testimonialId)

      if (updateError) {
        console.error('Error rejecting testimonial:', updateError)
        return NextResponse.json(
          { error: 'Failed to reject testimonial' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Testimonial rejected. Video will be deleted in 3 days.',
        deleteAt: deleteAt.toISOString(),
      })
    }
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Check and process expired testimonials (can be called by cron job)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cronSecret = searchParams.get('secret')

    // Optional: Verify cron secret for security
    // if (cronSecret !== process.env.CRON_SECRET) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const now = new Date().toISOString()
    let deletedCount = 0
    let expiredCount = 0

    // 1. Find PENDING testimonials older than 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const { data: pendingExpired, error: pendingError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('status', 'PENDING')
      .lt('recorded_at', tenDaysAgo.toISOString())

    if (!pendingError && pendingExpired) {
      for (const testimonial of pendingExpired) {
        // Delete from Cloudinary
        const publicId = testimonial.cloudinary_id || extractPublicId(testimonial.video_url)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }

        // Update status to DELETED
        await supabaseAdmin
          .from('testimonials')
          .update({
            status: 'DELETED',
            deleted_at: now,
          })
          .eq('id', testimonial.id)

        expiredCount++
      }
    }

    // 2. Find APPROVED testimonials past expires_at (15 days after approval)
    const { data: approvedExpired, error: approvedError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('status', 'APPROVED')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)

    if (!approvedError && approvedExpired) {
      for (const testimonial of approvedExpired) {
        // Delete from Cloudinary
        const publicId = testimonial.cloudinary_id || extractPublicId(testimonial.video_url)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }

        // Update status to DELETED
        await supabaseAdmin
          .from('testimonials')
          .update({
            status: 'DELETED',
            deleted_at: now,
          })
          .eq('id', testimonial.id)

        deletedCount++
      }
    }

    // 3. Find REJECTED testimonials past expires_at (3 days after rejection)
    const { data: rejectedExpired, error: rejectedError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('status', 'REJECTED')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)

    if (!rejectedError && rejectedExpired) {
      for (const testimonial of rejectedExpired) {
        // Delete from Cloudinary
        const publicId = testimonial.cloudinary_id || extractPublicId(testimonial.video_url)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }

        // Update status to DELETED
        await supabaseAdmin
          .from('testimonials')
          .update({
            status: 'DELETED',
            deleted_at: now,
          })
          .eq('id', testimonial.id)

        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      pendingExpired: expiredCount,
      deletedExpired: deletedCount,
      processedAt: now,
    })
  } catch (error) {
    console.error('Error in cleanup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
