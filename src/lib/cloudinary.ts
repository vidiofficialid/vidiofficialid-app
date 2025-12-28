import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Upload video dengan optimasi untuk social media
export async function uploadVideo(file: Buffer, options?: {
  folder?: string
  publicId?: string
}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'video' as const,
      folder: options?.folder || 'vidiofficialid/testimonials',
      public_id: options?.publicId,
      // Optimasi untuk social media (30 detik, kualitas rendah tapi bagus)
      transformation: [
        {
          quality: 'auto:low',
          fetch_format: 'mp4',
          video_codec: 'h264',
          audio_codec: 'aac',
          duration: '30', // Max 30 detik
        }
      ],
      eager: [
        // Generate thumbnail
        { width: 480, height: 480, crop: 'fill', format: 'jpg' }
      ],
      eager_async: true,
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )

    uploadStream.end(file)
  })
}

// Upload dari URL (untuk video yang sudah ada)
export async function uploadVideoFromUrl(url: string, options?: {
  folder?: string
  publicId?: string
}) {
  return cloudinary.uploader.upload(url, {
    resource_type: 'video',
    folder: options?.folder || 'vidiofficialid/testimonials',
    public_id: options?.publicId,
    transformation: [
      {
        quality: 'auto:low',
        fetch_format: 'mp4',
        video_codec: 'h264',
        audio_codec: 'aac',
      }
    ],
  })
}

// Delete video
export async function deleteVideo(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}

// Get optimized video URL untuk embed
export function getOptimizedVideoUrl(publicId: string, options?: {
  width?: number
  quality?: string
}) {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'mp4',
    quality: options?.quality || 'auto:low',
    width: options?.width || 720,
    crop: 'limit',
  })
}

// Get thumbnail URL
export function getThumbnailUrl(publicId: string, options?: {
  width?: number
  height?: number
}) {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    width: options?.width || 480,
    height: options?.height || 480,
    crop: 'fill',
    gravity: 'auto',
  })
}
