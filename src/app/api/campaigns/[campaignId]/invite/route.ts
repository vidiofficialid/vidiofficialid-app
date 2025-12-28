import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { campaignId } = await params
    const { method } = await request.json()

    // Verify ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        business: { userId: session.user.id }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Update campaign
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'INVITED',
        inviteSentAt: new Date(),
        inviteMethod: method
      }
    })

    return NextResponse.json({ success: true, campaign: updated })
  } catch (error) {
    console.error("Error updating invite status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
