import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await request.json()
    const {
      companyName, ownerName, nib, kbli, productCategory,
      productType, productTypeOther, email, whatsapp, logo
    } = data

    // Validasi
    if (!ownerName) return NextResponse.json({ error: "Nama Pemilik Usaha harus diisi" }, { status: 400 })
    if (!nib) return NextResponse.json({ error: "NIB harus diisi" }, { status: 400 })
    if (!kbli) return NextResponse.json({ error: "KBLI harus diisi" }, { status: 400 })
    if (!productCategory) return NextResponse.json({ error: "Kategori Produk harus dipilih" }, { status: 400 })
    if (!productType) return NextResponse.json({ error: "Jenis Produk harus dipilih" }, { status: 400 })
    if (!email) return NextResponse.json({ error: "Email usaha harus diisi" }, { status: 400 })
    if (!whatsapp) return NextResponse.json({ error: "WhatsApp harus diisi" }, { status: 400 })

    const displayName = companyName || ownerName
    const baseSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    
    let slug = baseSlug
    let counter = 1
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const business = await prisma.business.create({
      data: {
        userId: session.user.id,
        companyName: companyName || "-",
        ownerName, nib, kbli, productCategory, productType,
        productTypeOther: productType === "Lainnya" ? productTypeOther : null,
        email, whatsapp, logo,
        name: displayName, slug,
      }
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const businesses = await prisma.business.findMany({
      where: { userId: session.user.id },
      include: { campaigns: { include: { testimonials: true } } },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
