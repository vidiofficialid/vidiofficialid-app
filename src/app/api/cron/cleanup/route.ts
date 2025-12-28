import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Vercel Cron Job - runs daily
// Add to vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 0 * * *" }] }
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended for security)
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate date 15 days ago
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    // Find testimonials older than 15 days
    const oldTestimonials = await prisma.testimonial.findMany({
      where: {
        recordedAt: {
          lt: fifteenDaysAgo,
        },
      },
      select: {
        id: true,
        cloudinaryId: true,
        videoUrl: true,
      },
    })

    if (oldTestimonials.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No testimonials to delete",
        deleted: 0,
      })
    }

    // Delete from Cloudinary
    const cloudinaryDeletions: Promise<unknown>[] = []
    for (const testimonial of oldTestimonials) {
      if (testimonial.cloudinaryId) {
        cloudinaryDeletions.push(
          cloudinary.uploader
            .destroy(testimonial.cloudinaryId, { resource_type: "video" })
            .catch((err) => {
              console.error(`Failed to delete from Cloudinary: ${testimonial.cloudinaryId}`, err)
              return null
            })
        )
      }
    }

    // Wait for all Cloudinary deletions
    await Promise.all(cloudinaryDeletions)

    // Delete from database
    const deleteResult = await prisma.testimonial.deleteMany({
      where: {
        id: {
          in: oldTestimonials.map((t) => t.id),
        },
      },
    })

    // Update campaign status if no testimonials left
    const campaignIds = await prisma.testimonial.groupBy({
      by: ["campaignId"],
    })

    // Find campaigns with no testimonials
    const campaignsWithTestimonials = campaignIds.map((c) => c.campaignId)
    
    await prisma.campaign.updateMany({
      where: {
        status: { in: ["RECORDED", "COMPLETED"] },
        id: { notIn: campaignsWithTestimonials },
      },
      data: {
        status: "INVITED",
      },
    })

    console.log(`[Cleanup] Deleted ${deleteResult.count} testimonials older than 15 days`)

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteResult.count} testimonials`,
      deleted: deleteResult.count,
      testimonialIds: oldTestimonials.map((t) => t.id),
    })
  } catch (error) {
    console.error("[Cleanup Error]", error)
    return NextResponse.json(
      { error: "Failed to cleanup testimonials" },
      { status: 500 }
    )
  }
}

// Allow POST for manual trigger
export async function POST(request: NextRequest) {
  return GET(request)
}
