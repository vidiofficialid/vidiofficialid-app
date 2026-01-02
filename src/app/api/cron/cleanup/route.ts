import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const now = new Date().toISOString()
    let deletedCount = 0
    let pendingExpiredCount = 0
    const errors: string[] = []

    console.log('Starting testimonial cleanup at:', now)

    // 1. Find PENDING testimonials older than 10 days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const { data: pendingExpired, error: pendingError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('status', 'PENDING')
      .lt('recorded_at', tenDaysAgo.toISOString())

    if (pendingError) {
      errors.push(`Error fetching pending expired: ${pendingError.message}`)
    } else if (pendingExpired && pendingExpired.length > 0) {
      console.log(`Found ${pendingExpired.length} pending expired testimonials`)
      
      for (const testimonial of pendingExpired) {
        try {
          // Delete from Cloudinary
          const publicId = testimonial.cloudinary_id || extractPublicId(testimonial.video_url)
          if (publicId) {
            const deleted = await deleteFromCloudinary(publicId)
            console.log(`Cloudinary delete for ${publicId}: ${deleted}`)
          }

          // Update status to DELETED
          const { error: updateError } = await supabaseAdmin
            .from('testimonials')
            .update({
              status: 'DELETED',
              deleted_at: now,
            })
            .eq('id', testimonial.id)

          if (updateError) {
            errors.push(`Error updating ${testimonial.id}: ${updateError.message}`)
          } else {
            pendingExpiredCount++
          }
        } catch (err) {
          errors.push(`Error processing ${testimonial.id}: ${err}`)
        }
      }
    }

    // 2. Find APPROVED testimonials past expires_at (15 days after approval)
    const { data: approvedExpired, error: approvedError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('status', 'APPROVED')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)

    if (approvedError) {
      errors.push(`Error fetching approved expired: ${approvedError.message}`)
    } else if (approvedExpired && approvedExpired.length > 0) {
      console.log(`Found ${approvedExpired.length} approved expired testimonials`)
      
      for (const testimonial of approvedExpired) {
        try {
          // Delete from Cloudinary
          const publicId = testimonial.cloudinary_id || extractPublicId(testimonial.video_url)
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }

          // Update status to DELETED
          const { error: updateError } = await supabaseAdmin
            .from('testimonials')
            .update({
              status: 'DELETED',
              deleted_at: now,
            })
            .eq('id', testimonial.id)

          if (updateError) {
            errors.push(`Error updating ${testimonial.id}: ${updateError.message}`)
          } else {
            deletedCount++
          }
        } catch (err) {
          errors.push(`Error processing ${testimonial.id}: ${err}`)
        }
      }
    }

    // 3. Find REJECTED testimonials past expires_at (3 days after rejection)
    const { data: rejectedExpired, error: rejectedError } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('status', 'REJECTED')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)

    if (rejectedError) {
      errors.push(`Error fetching rejected expired: ${rejectedError.message}`)
    } else if (rejectedExpired && rejectedExpired.length > 0) {
      console.log(`Found ${rejectedExpired.length} rejected expired testimonials`)
      
      for (const testimonial of rejectedExpired) {
        try {
          // Delete from Cloudinary
          const publicId = testimonial.cloudinary_id || extractPublicId(testimonial.video_url)
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }

          // Update status to DELETED
          const { error: updateError } = await supabaseAdmin
            .from('testimonials')
            .update({
              status: 'DELETED',
              deleted_at: now,
            })
            .eq('id', testimonial.id)

          if (updateError) {
            errors.push(`Error updating ${testimonial.id}: ${updateError.message}`)
          } else {
            deletedCount++
          }
        } catch (err) {
          errors.push(`Error processing ${testimonial.id}: ${err}`)
        }
      }
    }

    const summary = {
      success: true,
      message: 'Cleanup completed',
      pendingExpired: pendingExpiredCount,
      approvedExpired: approvedExpired?.length || 0,
      rejectedExpired: rejectedExpired?.length || 0,
      totalDeleted: deletedCount + pendingExpiredCount,
      processedAt: now,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('Cleanup summary:', JSON.stringify(summary, null, 2))

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error in cleanup:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
