import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo } from '@/lib/cloudinary'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Optional: Check authentication untuk upload dari dashboard
    // const session = await auth()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const formData = await request.formData()
    const file = formData.get('video') as File
    const campaignId = formData.get('campaignId') as string
    const customerName = formData.get('customerName') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique public ID
    const timestamp = Date.now()
    const publicId = `${campaignId || 'general'}/${customerName?.replace(/\s+/g, '-') || 'anonymous'}-${timestamp}`

    // Upload to Cloudinary
    const result = await uploadVideo(buffer, {
      folder: 'vidiofficialid/testimonials',
      publicId,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// Set max file size for API route
export const config = {
  api: {
    bodyParser: false,
  },
}
