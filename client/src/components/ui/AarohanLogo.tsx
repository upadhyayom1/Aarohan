import React from 'react';

interface AarohanLogoProps {
  size?: number;
  className?: string;
  variant?: 'dark' | 'light';
}

// "Aarohan" signifies ascent / rise / climbing towards success.
// A clean, modern geometric logo featuring an upward soaring chevron and ascension indicator.
export function AarohanLogo({ size = 32, className = '', variant = 'dark' }: AarohanLogoProps) {
  const isLight = variant === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#111111';
  const fgColor = isLight ? '#111111' : '#FFFFFF';
  const strokeColor = isLight ? '#FFFFFF' : '#111111';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-label="Aarohan logo"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="6"
        fill={bgColor}
        stroke={strokeColor}
        strokeWidth="1"
      />
      {/* Dynamic soaring ascent arrow/chevron */}
      <path
        d="M9 19.5L16 10.5L23 19.5"
        stroke={fgColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Foundation marker / milestone tier */}
      <circle cx="16" cy="23.5" r="1.75" fill={fgColor} />
    </svg>
  );
}

