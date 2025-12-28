import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary config missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("logo") as File

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    console.log("Uploading file:", file.name, file.type, file.size)

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format harus PNG, JPEG, atau JPG" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 })
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary using base64
    const result = await cloudinary.uploader.upload(base64, {
      folder: "vidiofficialid/logos",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto:good" }
      ]
    })

    console.log("Upload success:", result.secure_url)

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url 
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: error.message || "Upload gagal" 
    }, { status: 500 })
  }
}
