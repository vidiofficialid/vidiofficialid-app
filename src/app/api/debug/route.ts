import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const envCheck = {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "not set",
    }

    let dbStatus = "unknown"
    let userCount = 0
    try {
      userCount = await prisma.user.count()
      dbStatus = "connected"
    } catch (dbError: unknown) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : String(dbError)}`
    }

    return NextResponse.json({
      status: "ok",
      env: envCheck,
      database: { status: dbStatus, userCount },
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
