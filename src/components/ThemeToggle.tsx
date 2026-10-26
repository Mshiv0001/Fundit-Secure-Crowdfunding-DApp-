'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Animated Morphing Sun ↔ Moon Theme Toggle
 * - Core sun sphere morphs seamlessly into a crescent moon via an animated eclipse SVG mask
 * - Solar rays burst outward and spin when forming the sun, and contract/dissolve into the core when forming the moon
 * - Micro-star sparkles twinkle in celestial mode beside the crescent moon
 * - Ultra-smooth spring easing curves with ambient luminescent bloom
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`group relative w-10 h-10 rounded-2xl liquid-btn-glass cursor-pointer flex items-center justify-center shrink-0 transition-all duration-300 active:scale-90 hover:border-white/30 focus:outline-none select-none ${className}`}
      title={isDark ? 'Switch to Light Mode (Morning Sun)' : 'Switch to Dark Mode (Midnight Moon)'}
      aria-label="Toggle theme"
    >
      {/* Background ambient glow pulse on hover */}
      <span
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 blur-md pointer-events-none ${
          isDark
            ? 'bg-amber-400/20 opacity-0 group-hover:opacity-100'
            : 'bg-indigo-500/25 opacity-0 group-hover:opacity-100'
        }`}
      />

      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-12"
        style={{
          transform: isDark ? 'rotate(0deg)' : 'rotate(35deg)',
          filter: isDark
            ? 'drop-shadow(0 0 7px rgba(251, 191, 36, 0.65))'
            : 'drop-shadow(0 0 7px rgba(129, 140, 248, 0.65))'
        }}
      >
        <defs>
          {/* Mask that carves the sun into a crescent moon */}
          <mask id="sun-moon-morph-mask">
            {/* White allows full visibility */}
            <rect x="0" y="0" width="24" height="24" fill="white" />
            {/* Black circle moves in to carve the crescent moon curve */}
            <circle
              cx={isDark ? '30' : '16.5'}
              cy={isDark ? '2' : '7.5'}
              r={isDark ? '6' : '7.5'}
              fill="black"
              className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            />
          </mask>

          {/* Golden Solar Gradient */}
          <linearGradient id="sunGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Celestial Lunar Gradient */}
          <linearGradient id="moonIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C7D2FE" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* 1. CENTRAL CELESTIAL BODY (Sun center circle or Moon crescent) */}
        <circle
          cx="12"
          cy="12"
          r={isDark ? '5' : '8'}
          fill={isDark ? 'url(#sunGoldGrad)' : 'url(#moonIndigoGrad)'}
          mask="url(#sun-moon-morph-mask)"
          className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center"
        />

        {/* 2. SOLAR RAYS (Burst out when Sun, contract and spin into center when Moon) */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center"
          style={{
            transformOrigin: '12px 12px',
            transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)',
            opacity: isDark ? 1 : 0
          }}
          stroke="url(#sunGoldGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {/* Cardinal Rays */}
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="20.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="3.5" y2="12" />
          <line x1="20.5" y1="12" x2="22.5" y2="12" />

          {/* Diagonal Rays */}
          <line x1="4.5" y1="4.5" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.5" y2="19.5" />
          <line x1="4.5" y1="19.5" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.5" y2="4.5" />
        </g>

        {/* 3. TWINKLING CELESTIAL STARS (Visible only in Moon mode) */}
        <g
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'scale(0)' : 'scale(1)',
            transformOrigin: '19px 5px'
          }}
        >
          {/* Micro star 1: top right */}
          <path
            d="M 19 3 Q 19 5 21 5 Q 19 5 19 7 Q 19 5 17 5 Q 19 5 19 3 Z"
            fill="#E0E7FF"
            className="animate-pulse"
          />
          {/* Micro star 2: lower right */}
          <path
            d="M 18 16 Q 18 17.5 19.5 17.5 Q 18 17.5 18 19 Q 18 17.5 16.5 17.5 Q 18 17.5 18 16 Z"
            fill="#C7D2FE"
            className="animate-pulse"
            style={{ animationDelay: '300ms' }}
          />
        </g>
      </svg>
    </button>
  );
};

export default ThemeToggle;
