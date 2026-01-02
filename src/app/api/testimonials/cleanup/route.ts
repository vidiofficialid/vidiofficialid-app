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

    const timestamp = Math.round(Date.now() / 1000)
    const crypto = await import('crypto')
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

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
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

// This endpoint can be called by a cron job to cleanup expired testimonials
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const deletedIds: string[] = []
    const errors: string[] = []

    // 1. Find PENDING testimonials older than 10 days
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    
    const { data: pendingExpired } = await supabaseAdmin
      .from('testimonials')
      .select('id, cloudinary_id, video_url')
      .eq('status', 'PENDING')
      .lt('created_at', tenDaysAgo.toISOString())

    // 2. Find APPROVED testimonials past expires_at
    const { data: approvedExpired } = await supabaseAdmin
      .from('testimonials')
      .select('id, cloudinary_id, video_url')
      .eq('status', 'APPROVED')
      .lt('expires_at', now.toISOString())

    // 3. Find REJECTED testimonials past expires_at (3 days after rejection)
    const { data: rejectedExpired } = await supabaseAdmin
      .from('testimonials')
      .select('id, cloudinary_id, video_url')
      .eq('status', 'REJECTED')
      .lt('expires_at', now.toISOString())

    // Combine all expired testimonials
    const allExpired = [
      ...(pendingExpired || []),
      ...(approvedExpired || []),
      ...(rejectedExpired || []),
    ]

    // Process each expired testimonial
    for (const testimonial of allExpired) {
      try {
        // Extract public_id from cloudinary_id or video_url
        let publicId = testimonial.cloudinary_id
        
        if (!publicId && testimonial.video_url) {
          // Try to extract from URL
          const match = testimonial.video_url.match(/\/vidi-testimonials\/([^.]+)/)
          if (match) {
            publicId = `vidi-testimonials/${match[1]}`
          }
        }

        // Delete from Cloudinary if we have public_id
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }

        // Update status to DELETED in database
        await supabaseAdmin
          .from('testimonials')
          .update({
            status: 'DELETED',
            deleted_at: now.toISOString(),
            video_url: '', // Clear video URL
          })
          .eq('id', testimonial.id)

        deletedIds.push(testimonial.id)
      } catch (err) {
        errors.push(`Failed to delete ${testimonial.id}: ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedIds.length} testimonials.`,
      deleted: deletedIds,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error in cleanup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check cleanup status
export async function GET() {
  try {
    const now = new Date()
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)

    // Count pending expired
    const { count: pendingExpired } = await supabaseAdmin
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')
      .lt('created_at', tenDaysAgo.toISOString())

    // Count approved expired
    const { count: approvedExpired } = await supabaseAdmin
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'APPROVED')
      .lt('expires_at', now.toISOString())

    // Count rejected expired
    const { count: rejectedExpired } = await supabaseAdmin
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'REJECTED')
      .lt('expires_at', now.toISOString())

    return NextResponse.json({
      pending_expired: pendingExpired || 0,
      approved_expired: approvedExpired || 0,
      rejected_expired: rejectedExpired || 0,
      total_to_cleanup: (pendingExpired || 0) + (approvedExpired || 0) + (rejectedExpired || 0),
    })
  } catch (error) {
    console.error('Error checking cleanup status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
