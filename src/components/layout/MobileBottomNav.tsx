"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Flame, ShieldAlert, PlusCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide on pay/checkout routes for distraction-free payment
  if (pathname.startsWith("/pay/")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Browse",
      href: "/browse",
      icon: Sparkles,
      isActive: pathname.startsWith("/browse") || pathname.startsWith("/listings"),
    },
    {
      label: "Drops 🔥",
      href: "/#friday-drops",
      icon: Flame,
      badge: "-50%",
      isActive: false,
    },
    {
      label: "Scammers",
      href: "/scammer-check",
      icon: ShieldAlert,
      badgeDot: true,
      isActive: pathname.startsWith("/scammer-check"),
    },
    {
      label: "Sell",
      href: "/seller/create-listing",
      icon: PlusCircle,
      highlight: true,
      isActive: pathname.startsWith("/seller"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 shadow-2xl safe-area-pb"
    >
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all relative ${
                item.highlight
                  ? "text-[#22C55E]"
                  : item.isActive
                  ? "text-[#22C55E] bg-slate-900/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                  } ${item.highlight ? "text-[#22C55E]" : ""}`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[8px] font-black text-slate-950 uppercase">
                    {item.badge}
                  </span>
                )}
                {item.badgeDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090D16]" />
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[56px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
