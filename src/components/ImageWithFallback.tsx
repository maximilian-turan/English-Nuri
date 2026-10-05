import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  theme?: 'vocab' | 'speak' | 'read' | 'sound' | 'skills';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  theme = 'speak',
}) => {
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleError = () => {
    if (!triedFallback && fallbackSrc) {
      setTriedFallback(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    // Elegant, bespoke vector fallback card if image is blocked or unavailable
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 select-none relative overflow-hidden ${
          theme === 'vocab'
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900/60 text-emerald-300'
            : theme === 'speak'
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/60 text-indigo-300'
            : theme === 'read'
            ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900/60 text-amber-300'
            : theme === 'sound'
            ? 'bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900/60 text-teal-300'
            : 'bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900/60 text-cyan-300'
        } ${className}`}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-current/30 flex items-center justify-center shadow-lg">
            {theme === 'vocab' && <span className="text-2xl font-bold font-serif">1K</span>}
            {theme === 'speak' && <span className="text-2xl font-bold">🎙️</span>}
            {theme === 'read' && <span className="text-2xl font-bold">📖</span>}
            {theme === 'sound' && <span className="text-2xl font-bold">🔊</span>}
            {theme === 'skills' && <span className="text-2xl font-bold">📊</span>}
          </div>
          <span className="font-serif font-bold text-sm tracking-tight text-white max-w-[220px]">
            {alt}
          </span>
          <span className="text-[11px] opacity-75 font-mono">100% Offline · Lokal verfügbar</span>
        </div>
      </div>
    );
  }

  const currentSrc = (triedFallback && fallbackSrc) ? fallbackSrc : (src || fallbackSrc || '');

  return (
    <img
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="eager"
    />
  );
};
