import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
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

    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video size must be less than 50MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const publicId = `${campaignId || 'general'}/${customerName?.replace(/\s+/g, '-') || 'anonymous'}-${timestamp}`

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
