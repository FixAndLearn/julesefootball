import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  clickable?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  showText = true,
  clickable = false,
}: LogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }[size];

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  }[size];

  const subtitleSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-xs",
  }[size];

  const LogoIcon = (
    <div className={`relative ${iconDimensions} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="efm-shield-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="efm-gold-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="efm-accent-grad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Outer Hex-Shield Crest */}
        <path
          d="M24 4L42 10V22C42 33.2 34.3 43.1 24 46C13.7 43.1 6 33.2 6 22V10L24 4Z"
          fill="url(#efm-shield-grad)"
          stroke="url(#efm-gold-grad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner Subtle Depth Border */}
        <path
          d="M24 7.5L39 12.5V22C39 31.5 32.5 39.8 24 42.5C15.5 39.8 9 31.5 9 22V12.5L24 7.5Z"
          fill="#0a1226"
          fillOpacity="0.85"
        />

        {/* Soccer Ball Hexagon Geometry */}
        <circle cx="24" cy="22" r="10" stroke="url(#efm-accent-grad)" strokeWidth="1.8" fill="#0e1b38" />

        {/* Central Soccer Panel / Pentagram */}
        <polygon
          points="24,17 28,20 26.5,25 21.5,25 20,20"
          fill="url(#efm-gold-grad)"
        />

        {/* Ball Seam Lines */}
        <line x1="24" y1="17" x2="24" y2="12" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="28" y1="20" x2="32.5" y2="18.5" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="26.5" y1="25" x2="31" y2="28" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="21.5" y1="25" x2="17" y2="28" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="20" y1="20" x2="15.5" y2="18.5" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Escrow Lock Symbol at Bottom of Crest */}
        <g transform="translate(19, 32)">
          <rect x="1.5" y="4" width="7" height="5" rx="1.5" fill="#f59e0b" />
          <path
            d="M3 4V2.5C3 1.67 3.67 1 4.5 1H5.5C6.33 1 7 1.67 7 2.5V4"
            stroke="#fbbf24"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="5" cy="6.5" r="0.8" fill="#090d16" />
        </g>
      </svg>
    </div>
  );

  const Content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {LogoIcon}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-black tracking-tight text-white ${titleSizes}`}>
            eFootball<span className="text-amber-400">Market</span>
          </span>
          <span className={`uppercase tracking-widest text-emerald-400 font-bold mt-1 ${subtitleSizes}`}>
            Escrow Protected
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="group inline-flex items-center">
        {Content}
      </Link>
    );
  }

  return Content;
}
