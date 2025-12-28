import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const business = await prisma.business.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error("Error fetching business:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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

    // Verify ownership
    const existing = await prisma.business.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        name: body.name,
        companyName: body.companyName || "-",
        ownerName: body.ownerName,
        nib: body.nib || null,
        kbli: body.kbli,
        productCategory: body.productCategory,
        productType: body.productType,
        productTypeOther: body.productTypeOther || null,
        email: body.email,
        whatsapp: body.whatsapp,
        logo: body.logo || null,
      }
    })

    return NextResponse.json({ business })
  } catch (error) {
    console.error("Error updating business:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Verify ownership
    const existing = await prisma.business.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    await prisma.business.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting business:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
