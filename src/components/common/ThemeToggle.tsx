"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-1.5 p-2 rounded-xl border border-transparent ${className}`}>
        <div className="w-4 h-4" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-xl border transition-all active:scale-95 ${
        isDark
          ? "bg-[#0D1629] border-slate-700/80 text-amber-300 hover:border-amber-400/50 hover:bg-[#152238]"
          : "bg-white border-slate-300 text-slate-800 shadow-sm hover:bg-slate-100"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold whitespace-nowrap">
          {isDark ? "Bright Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
