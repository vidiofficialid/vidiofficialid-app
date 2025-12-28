import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { campaignId } = await params

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        business: { userId: session.user.id }
      },
      include: {
        business: true,
        testimonials: true
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { campaignId } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        business: { userId: session.user.id }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: body
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { campaignId } = await params

    // Verify ownership
    const existing = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        business: { userId: session.user.id }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    await prisma.campaign.delete({ where: { id: campaignId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
