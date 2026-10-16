import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-6 py-3 h-12 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#22C55E] text-slate-950 font-semibold hover:bg-emerald-400 focus:ring-[#22C55E] shadow-lg shadow-emerald-950/40",
      secondary:
        "bg-[#1F2937] text-[#F8FAFC] hover:bg-slate-700 border border-slate-700 focus:ring-slate-400",
      outline:
        "border border-slate-700 text-slate-200 hover:bg-slate-800/80 hover:text-white focus:ring-slate-500",
      ghost:
        "text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-600",
      danger:
        "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-lg shadow-rose-600/30",
      gold:
        "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-semibold hover:from-amber-300 hover:to-amber-400 focus:ring-amber-400 shadow-lg shadow-amber-500/20",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
