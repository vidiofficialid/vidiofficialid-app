import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get('video') as File
    const campaignId = formData.get('campaignId') as string

    if (!video || !campaignId) {
      return NextResponse.json({ error: "Missing video or campaignId" }, { status: 400 })
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (video.size > maxSize) {
      return NextResponse.json({ error: "File terlalu besar. Maksimal 50MB." }, { status: 413 })
    }

    console.log('Upload request:', {
      name: video.name,
      type: video.type,
      size: video.size,
      campaignId
    })

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with compression
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: `vidiofficialid/testimonials/${campaignId}`,
          transformation: [
            { 
              quality: 'auto:low',
              fetch_format: 'mp4',
              video_codec: 'h264',
              audio_codec: 'aac',
              bit_rate: '500k'
            }
          ],
          eager: [
            { width: 480, height: 480, crop: 'fill', format: 'jpg', start_offset: '0' }
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      uploadStream.end(buffer)
    })

    console.log('Cloudinary result:', uploadResult.secure_url)

    const testimonial = await prisma.testimonial.create({
      data: {
        campaignId,
        videoUrl: uploadResult.secure_url,
        thumbnailUrl: uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg'),
        cloudinaryId: uploadResult.public_id,
        duration: Math.round(uploadResult.duration) || null,
        fileSize: uploadResult.bytes || null,
        recordedAt: new Date(),
        status: 'PENDING'
      }
    })

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'RECORDED' }
    })

    return NextResponse.json({ 
      success: true, 
      testimonial: {
        id: testimonial.id,
        videoUrl: testimonial.videoUrl
      }
    })

  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: error.message || "Upload failed" 
    }, { status: 500 })
  }
}
