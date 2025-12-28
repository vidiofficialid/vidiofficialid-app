import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json()
    
    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = `vidiofficialid/testimonials/${campaignId}`
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch (error: any) {
    console.error("Signature error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
