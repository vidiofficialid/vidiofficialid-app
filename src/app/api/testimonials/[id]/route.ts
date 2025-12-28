import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET - Get single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const testimonial = await prisma.testimonial.findFirst({
      where: { id },
      include: {
        campaign: {
          include: {
            business: {
              select: { userId: true, name: true }
            }
          }
        }
      }
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    if (testimonial.campaign.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH - Update testimonial status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, APPROVED, or REJECTED" },
        { status: 400 }
      )
    }

    const testimonial = await prisma.testimonial.findFirst({
      where: { id },
      include: {
        campaign: {
          include: {
            business: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    if (testimonial.campaign.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update testimonial status
    const updated = await prisma.testimonial.update({
      where: { id },
      data: { status }
    })

    // If all testimonials are approved, update campaign to COMPLETED
    if (status === "APPROVED") {
      const pendingCount = await prisma.testimonial.count({
        where: {
          campaignId: testimonial.campaignId,
          status: { not: "APPROVED" }
        }
      })

      if (pendingCount === 0) {
        await prisma.campaign.update({
          where: { id: testimonial.campaignId },
          data: { status: "COMPLETED" }
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const testimonial = await prisma.testimonial.findFirst({
      where: { id },
      include: {
        campaign: {
          include: {
            business: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    if (testimonial.campaign.business.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete from Cloudinary
    if (testimonial.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(testimonial.cloudinaryId, {
          resource_type: "video"
        })
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError)
      }
    }

    // Delete from database
    await prisma.testimonial.delete({ where: { id } })

    // Update campaign status if no more testimonials
    const remainingTestimonials = await prisma.testimonial.count({
      where: { campaignId: testimonial.campaignId }
    })

    if (remainingTestimonials === 0) {
      await prisma.campaign.update({
        where: { id: testimonial.campaignId },
        data: { status: "INVITED" }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
