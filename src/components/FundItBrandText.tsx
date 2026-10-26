'use client';

import React from 'react';

interface FundItBrandTextProps {
  className?: string;
  height?: number | string;
  glow?: boolean;
}

/**
 * Custom Bespoke Orbitron Ligature for "FUNDIT"
 * - Square, balanced, mathematical proportions (width 68 per letter, height 80, stem 20)
 * - F top connector bar flows directly into U left stem (x: 0 to 72)
 * - Shared U-N stem: right stem of U is the left stem of N (x: 100 to 120)
 * - Middle diagonal bar of N connects seamlessly into the left bar of N (from y: 0 to 28)
 * - Shared N-D stem: right stem of N is the straight left stem of D (x: 148 to 168)
 * - Symmetrical D with 45° chamfers and matching counter width (28px)
 * - Followed by IT in signature platform neon gradient with bilateral symmetry
 */
export const FundItBrandText: React.FC<FundItBrandTextProps> = ({
  className = '',
  height = 24,
  glow = true
}) => {
  return (
    <svg
      viewBox="0 0 360 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height, width: 'auto' }}
      className={`select-none overflow-visible ${className}`}
    >
      <defs>
        {/* Neon Gradient matching the website's Liquid Escrow & Primary CTA identity */}
        <linearGradient id="fundItNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="48%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#00E599" />
        </linearGradient>

        {/* Glow filter for white FUND */}
        <filter id="fundWhiteGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(255, 255, 255, 0.5)" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="rgba(6, 182, 212, 0.25)" />
        </filter>

        {/* Glow filter for neon IT matching theme primary and success */}
        <filter id="itNeonGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(6, 182, 212, 0.85)" />
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="rgba(0, 229, 153, 0.5)" />
        </filter>
      </defs>

      {/* ================================================================
          "FUND" CONTINUOUS CONNECTED LIGATURE (WHITE) - STRETCHED GEOMETRY
          - F top bar combines into U left stem (x: 0 to 78)
          - Shared U-N stem: right stem of U is the left stem of N (x: 112 to 132)
          - Middle diagonal bar of N connects seamlessly into the left bar of N
          - Shared N-D stem: right stem of N is the straight left bar of D (x: 166 to 186)
          - Symmetrical D with 45° chamfers and stretched counter width
         ================================================================ */}
      <g filter={glow ? 'url(#fundWhiteGlow)' : undefined} fill="#FFFFFF">
        
        {/* 1. LETTER F: Left stem & Centered middle arm */}
        <rect x="0" y="0" width="20" height="80" />
        <rect x="20" y="32" width="30" height="16" />

        {/* 2. F-TO-U TOP CONNECTOR (Top bar of F combines into U left stem) */}
        <rect x="20" y="0" width="58" height="20" />

        {/* 3. LETTER U: Left stem, 45° bottom chamfers, and bottom bar */}
        <path d="M 58 20 L 78 20 L 78 60 L 112 60 L 112 20 L 132 20 L 132 64 L 114 80 L 76 80 L 58 64 Z" />

        {/* 4. SHARED U-N STEM (Right bar of U IS the left bar of N) */}
        <rect x="112" y="0" width="20" height="80" />

        {/* 5. LETTER N: Middle diagonal bar connected directly to left bar of N */}
        <path d="M 112 0 L 142 0 L 166 52 L 186 80 L 156 80 L 132 28 Z" />

        {/* 6. SHARED N-D STEM (Right bar of N IS the straight left bar of D) */}
        <rect x="166" y="0" width="20" height="80" />

        {/* 7. LETTER D: Outer chamfered contour and counter cutout */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 166 0 L 226 0 L 242 14 L 242 66 L 226 80 L 166 80 Z M 186 20 L 212 20 L 220 26 L 220 54 L 212 60 L 186 60 Z"
        />

      </g>

      {/* ================================================================
          "IT" (SIGNATURE PLATFORM NEON GRADIENT: INDIGO -> CYAN -> EMERALD)
          - Stretched crossbar on T, snug kerning with I
         ================================================================ */}
      <g filter={glow ? 'url(#itNeonGlow)' : undefined} fill="url(#fundItNeonGrad)">
        
        {/* LETTER I: Thick straight vertical stem */}
        <rect x="258" y="0" width="20" height="80" />

        {/* LETTER T: Symmetrical top crossbar brought snug to I, with centered stem */}
        <rect x="286" y="0" width="74" height="20" />
        <rect x="313" y="20" width="20" height="60" />

      </g>
    </svg>
  );
};

export default FundItBrandText;
