import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Handcrafted Architectural Emblem: NextLumen Insignia */}
      <div
        className={`${iconDimensions} rounded-lg bg-slate-950 border border-amber-500/40 flex items-center justify-center shadow-sm relative shrink-0 transition-transform group-hover:scale-102`}
        style={{
          boxShadow: 'inset 0 1px 0 0 rgba(245, 158, 11, 0.25), 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nlGoldGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="nlFlameGrad" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Background subtle geometry */}
          <rect x="2" y="2" width="28" height="28" rx="6" stroke="#475569" strokeWidth="0.75" strokeOpacity="0.3" />

          {/* Left Architectural Pillar of 'N' */}
          <path
            d="M7.5 8H10.5V24H7.5V8Z"
            fill="url(#nlGoldGrad)"
          />
          <path d="M6.5 8H11.5M6.5 24H11.5" stroke="url(#nlGoldGrad)" strokeWidth="1" strokeLinecap="round" />

          {/* Right Architectural Pillar of 'N' */}
          <path
            d="M21.5 8H24.5V24H21.5V8Z"
            fill="url(#nlGoldGrad)"
          />
          <path d="M20.5 8H25.5M20.5 24H25.5" stroke="url(#nlGoldGrad)" strokeWidth="1" strokeLinecap="round" />

          {/* Dynamic Diagonal Bridge */}
          <path
            d="M10 9.5L22 22.5"
            stroke="url(#nlGoldGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* The 'Lumen' Radiant Beacon (Torch / Sound Diamond at center) */}
          <path
            d="M16 9.5L18.2 14L16 18.5L13.8 14L16 9.5Z"
            fill="url(#nlFlameGrad)"
          />
          <circle cx="16" cy="14" r="1.2" fill="#FFFFFF" />

          {/* Subtle acoustic resonance arcs */}
          <path
            d="M16 6.5C18 6.5 19.5 7.2 20.5 8.2"
            stroke="#FDE68A"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <path
            d="M16 4.5C19.2 4.5 21.8 5.6 23.2 7"
            stroke="#F59E0B"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* Typography: Oxford Editorial Wordmark */}
      <div className="flex flex-col justify-center select-none">
        <div className="flex items-baseline gap-1 leading-none">
          <span className={`font-serif font-bold ${titleSizes} tracking-tight text-slate-100`}>
            Next<span className="font-normal italic text-amber-400">Lumen</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] uppercase tracking-[0.24em] text-slate-400 font-semibold font-sans mt-0.5">
            English Academy
          </span>
        )}
      </div>
    </div>
  );
};
