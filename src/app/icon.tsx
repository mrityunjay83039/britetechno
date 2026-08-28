import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

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
          background: '#0F0F11',
          borderRadius: '6px',
          border: '1px solid rgba(197, 168, 128, 0.4)',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#C5A880"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Petal 1 */}
          <path d="M 35 30 C 28 16, 41 2, 55 8 C 65 12, 68 22, 61 32" />

          {/* Petal 2 */}
          <path d="M 61 32 C 71 20, 89 24, 87 40 C 85 50, 73 56, 61 54" />

          {/* Petal 3 */}
          <path d="M 61 54 C 71 64, 63 80, 47 76 C 37 72, 35 60, 41 50" />

          {/* Petal 4 */}
          <path d="M 41 50 C 29 60, 11 54, 15 38 C 18 28, 29 26, 35 30" />

          {/* Center Stamen */}
          <circle cx="48" cy="41" r="5" fill="#C5A880" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
