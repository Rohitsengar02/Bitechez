import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  shopName: string;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ shopName, onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 1.5s display time then smooth fade-out
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onFinish();
      }, 400);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  // Capitalize shopname nicely
  const displayTitle = shopName
    ? shopName.charAt(0).toUpperCase() + shopName.slice(1).replace(/[-_]/g, ' ')
    : 'CyberLim';

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-[#34D399] sm:bg-[#00C060] flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #34D399 0%, #10B981 40%, #059669 100%)',
      }}
    >
      {/* Phone Status Bar (matching design: 19:02 | Signal | Wifi | Battery) */}
      <div className="w-full px-6 pt-3 flex items-center justify-between text-slate-900 text-xs font-black z-20">
        <span>19:02</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 fill-current" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 fill-current" />
        </div>
      </div>

      {/* Center Brand Identity (matching the reference image's logo & typography) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10 z-20">
        {/* Geometric Winged Logo Emblem */}
        <div className="relative mb-4 animate-in zoom-in-75 duration-500">
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            {/* SVG folded ribbon / leaf logo matching FrushGo / Cyberlim */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <polygon points="20,15 50,15 35,48 20,48" fill="#111827" />
              <polygon points="52,22 82,22 67,55 37,55" fill="#111827" />
              <polygon points="20,52 68,52 53,85 20,85" fill="#111827" />
            </svg>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {displayTitle}
        </h1>
        <p className="text-xs font-extrabold text-emerald-950/80 tracking-wide mt-1 uppercase">
          Smart Dining & Fast Delivery
        </p>

        {/* Loading dots / Skip Pill */}
        <div className="mt-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-slate-900 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
          <span>Tap anywhere to skip</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </div>
      </div>

      {/* Bottom Illustration with curved dome & delivery rider (matching reference) */}
      <div className="relative w-full z-10 flex flex-col items-center justify-end">
        {/* Light green curved dome */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 sm:h-56 bg-[#6EE7B7] rounded-t-[50%] -z-10 shadow-inner"
          style={{ transform: 'scaleX(1.3)' }}
        />

        {/* Courier / Rider Illustration SVG */}
        <div className="w-48 h-44 sm:w-56 sm:h-52 relative flex items-end justify-center mb-1">
          <svg viewBox="0 0 200 180" className="w-full h-full">
            {/* Delivery Backpack */}
            <rect x="25" y="65" width="45" height="55" rx="8" fill="#1F2937" transform="rotate(-18 35 70)" />
            <rect x="30" y="60" width="38" height="12" rx="4" fill="#374151" transform="rotate(-18 35 70)" />
            {/* Body */}
            <circle cx="100" cy="120" r="45" fill="#047857" />
            <path d="M 60 150 Q 100 115 140 150 Z" fill="#059669" />
            {/* Arms holding phone */}
            <path d="M 105 125 Q 125 120 145 135" stroke="#047857" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Face & Cap */}
            <circle cx="102" cy="75" r="22" fill="#FDE68A" />
            {/* Mask */}
            <path d="M 90 75 Q 102 92 118 75 Z" fill="#FFFFFF" />
            <circle cx="95" cy="68" r="2.5" fill="#1F2937" />
            <circle cx="110" cy="68" r="2.5" fill="#1F2937" />
            {/* Green Cap */}
            <path d="M 80 70 Q 102 45 125 70 Z" fill="#059669" />
            <path d="M 88 62 L 145 66" stroke="#047857" strokeWidth="6" strokeLinecap="round" />
            {/* Smartphone with location pin */}
            <rect x="135" y="115" width="22" height="34" rx="4" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2.5" />
            <circle cx="146" cy="128" r="4" fill="#EF4444" />
            <circle cx="146" cy="128" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

