"use client"

interface PixelLogoProps {
  className?: string
}

export function PixelLogo({ className = "" }: PixelLogoProps) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      className={`pixel-perfect ${className}`}
      fill="currentColor"
    >
      {/* Simple pixel art logo - can be customized */}
      <rect x="8" y="8" width="2" height="2" />
      <rect x="12" y="8" width="2" height="2" />
      <rect x="16" y="8" width="2" height="2" />
      <rect x="20" y="8" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="14" y="10" width="2" height="2" />
      <rect x="18" y="10" width="2" height="2" />
      <rect x="8" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
      <rect x="16" y="12" width="2" height="2" />
      <rect x="20" y="12" width="2" height="2" />
      <rect x="10" y="14" width="2" height="2" />
      <rect x="14" y="14" width="2" height="2" />
      <rect x="18" y="14" width="2" height="2" />
      <rect x="8" y="16" width="2" height="2" />
      <rect x="12" y="16" width="2" height="2" />
      <rect x="16" y="16" width="2" height="2" />
      <rect x="20" y="16" width="2" height="2" />
      <rect x="10" y="18" width="2" height="2" />
      <rect x="14" y="18" width="2" height="2" />
      <rect x="18" y="18" width="2" height="2" />
    </svg>
  )
}

