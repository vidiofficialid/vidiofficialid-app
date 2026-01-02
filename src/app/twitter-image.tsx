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
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '50px',
          position: 'relative',
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(253, 196, 53, 0.2) 0%, rgba(253, 196, 53, 0.05) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(21, 235, 185, 0.2) 0%, rgba(21, 235, 185, 0.05) 100%)',
          }}
        />

        {/* Logo Icon Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          {/* Stylized Logo Representation */}
          <div
            style={{
              width: '140px',
              height: '140px',
              background: 'linear-gradient(135deg, #FDC435 0%, #F5B800 100%)',
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(253, 196, 53, 0.4)',
              position: 'relative',
              border: '4px solid #1a1a1a',
            }}
          >
            {/* Microphone icon */}
            <div
              style={{
                position: 'absolute',
                left: '-45px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '80px',
                background: '#15EBB9',
                borderRadius: '12px',
                border: '3px solid #1a1a1a',
              }}
            />
            {/* Face - Eyes */}
            <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#1a1a1a',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#1a1a1a',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '16px',
            letterSpacing: '-1px',
          }}
        >
          VidiOfficialID
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#495057',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          Layanan Video Testimonial untuk UMKM Indonesia
        </div>

        {/* Feature Tags */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            '✓ Tanpa Download Aplikasi',
            '✓ Langsung Buka di Browser',
            '✓ Social Proof Produk UMKM',
          ].map((tag, i) => (
            <div
              key={i}
              style={{
                background: i === 2 ? '#15EBB9' : '#FDC435',
                color: '#1a1a1a',
                padding: '12px 24px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Website URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#6c757d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              background: '#15EBB9',
              borderRadius: '50%',
            }}
          />
          vidi.official.id
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
