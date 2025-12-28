import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { campaignId, videoUrl, publicId, duration, fileSize } = await request.json()

    if (!campaignId || !videoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        campaignId,
        videoUrl,
        thumbnailUrl: videoUrl.replace(/\.[^.]+$/, '.jpg'),
        cloudinaryId: publicId,
        duration: duration ? Math.round(duration) : null,
        fileSize: fileSize || null,
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
    console.error("Save testimonial error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
