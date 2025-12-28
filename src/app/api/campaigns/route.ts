import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List all campaigns for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    const whereClause = businessId
      ? {
          businessId,
          business: { userId: session.user.id }
        }
      : {
          business: { userId: session.user.id }
        }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        testimonials: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.businessId || !data.title || !data.brandName || !data.testimonialScript || !data.customerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: data.businessId,
        userId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: "Business not found or unauthorized" },
        { status: 404 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        businessId: data.businessId,
        title: data.title,
        brandName: data.brandName,
        productImage: data.productImage || null,
        testimonialScript: data.testimonialScript,
        gestureGuide: data.gestureGuide || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerWhatsapp: data.customerWhatsapp || null,
        status: "DRAFT"
      }
    })

    return NextResponse.json({ success: true, campaign }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
