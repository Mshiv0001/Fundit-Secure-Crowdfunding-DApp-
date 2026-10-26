'use client';

import React from 'react';

interface FundItLogoProps {
  size?: number | string;
  className?: string;
}

/**
 * Fund It Official Shield & Growth Arrow Emblem
 * - Completely transparent background (no black rounded box)
 * - Neon Electric Cyan to Emerald/Mint gradient stroke
 * - Outer subtle bloom glow
 */
export const FundItLogo: React.FC<FundItLogoProps> = ({
  size = 40,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      className={`select-none shrink-0 overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id="navLogoShieldGrad" x1="20%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="45%" stopColor="#0EA5E9" />
          <stop offset="75%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#00E599" />
        </linearGradient>
        <filter id="navLogoBloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield & Growth Arrow with Glow — 100% transparent background, NO black box */}
      <g filter="url(#navLogoBloom)">
        {/* Shield Translucent Ambient Glass Tint */}
        <path
          d="M 100 26 C 122 36 148 38 164 50 C 164 96 156 136 100 176 C 44 136 36 96 36 50 C 52 38 78 36 100 26 Z"
          fill="rgba(6, 182, 212, 0.12)"
        />

        {/* Outer Shield Neon Contour */}
        <path
          d="M 100 26 C 122 36 148 38 164 50 C 164 96 156 136 100 176 C 44 136 36 96 36 50 C 52 38 78 36 100 26 Z"
          stroke="url(#navLogoShieldGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Shield Accent Track */}
        <path
          d="M 100 40 C 118 48 138 50 150 60 C 150 94 142 124 100 158 C 58 124 50 94 50 60 C 62 50 82 48 100 40 Z"
          stroke="url(#navLogoShieldGrad)"
          strokeWidth="2.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Zigzag Trend Growth Line (Stretched dynamically across shield) */}
        <path
          d="M 46 140 L 86 86 L 108 116 L 162 50"
          stroke="url(#navLogoShieldGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 46 140 L 86 86 L 108 116 L 162 50"
          stroke="#E0F7FF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arrow Head */}
        <polygon
          points="154,36 182,30 176,58 167,48 162,52"
          fill="url(#navLogoShieldGrad)"
          stroke="#E0F7FF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default FundItLogo;
