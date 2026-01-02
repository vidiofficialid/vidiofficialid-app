import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'VidiOfficialID - Platform Video Testimonial UMKM Indonesia'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #15EBB9 0%, #0ea5e9 50%, #6366f1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          {/* Play Button Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: '8px' }}
            >
              <path
                d="M5 4.99C5 4.01 6.1 3.42 6.91 3.97L18.1 11.48C18.82 11.96 18.82 13.04 18.1 13.52L6.91 21.03C6.1 21.58 5 20.99 5 20.01V4.99Z"
                fill="#15EBB9"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
            textShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          VidiOfficialID
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            marginBottom: '30px',
            maxWidth: '900px',
          }}
        >
          Layanan Video Testimonial untuk UMKM Indonesia
        </div>

        {/* Description Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '24px 40px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            ✓ Tanpa download aplikasi • ✓ Langsung buka di browser • ✓ Social proof untuk produk UMKM
          </div>
        </div>

        {/* Website URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          vidi.official.id
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
