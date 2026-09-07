import React from 'react'
interface BrandMarkProps {
  compact?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ compact = false }) => {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#B18445]/45 bg-[#1F6B55] shadow-[0_8px_18px_rgba(31,107,85,0.2)] ${compact ? 'h-9 w-9' : 'h-12 w-12'}`}
    >
      <img
        src="/logo.png"
        alt="SmartSpace logo"
        className="h-full w-full scale-[1.28] object-cover"
        decoding="async"
      />
    </span>
  )
}
