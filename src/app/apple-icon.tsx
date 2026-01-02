import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #15EBB9 0%, #0ea5e9 100%)',
          borderRadius: '36px',
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M5 4.99C5 4.01 6.1 3.42 6.91 3.97L18.1 11.48C18.82 11.96 18.82 13.04 18.1 13.52L6.91 21.03C6.1 21.58 5 20.99 5 20.01V4.99Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
