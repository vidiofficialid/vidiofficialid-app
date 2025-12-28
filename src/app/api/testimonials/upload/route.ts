import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get('video') as File
    const campaignId = formData.get('campaignId') as string

    if (!video || !campaignId) {
      return NextResponse.json({ error: "Missing video or campaignId" }, { status: 400 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: `vidiofficialid/testimonials/${campaignId}`,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'mp4' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const testimonial = await prisma.testimonial.create({
      data: {
        campaignId,
        videoUrl: uploadResult.secure_url,
        thumbnailUrl: uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg'),
        cloudinaryId: uploadResult.public_id,
        duration: uploadResult.duration || null,
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

  } catch (error) {
    console.error("Error uploading testimonial:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
