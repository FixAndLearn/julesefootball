"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, ShieldCheck, ShieldAlert, PlusCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/auth");

  const isHighIntentRoute =
    pathname.startsWith("/pay/") ||
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/listings/") ||
    pathname === "/seller/create-listing" ||
    pathname === "/seller/verification" ||
    pathname === "/profile";

  // Hide on pay/checkout, escrow orders, detail routes, forms, and auth flows to prevent congestion
  if (isHighIntentRoute || isAuthRoute) {
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
      isActive: pathname.startsWith("/browse"),
    },
    {
      label: "Sell",
      href: "/seller/create-listing",
      icon: PlusCircle,
      highlight: true,
      isActive: pathname.startsWith("/seller"),
    },
    {
      label: "Escrow",
      href: "/escrow-guarantee",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/escrow-guarantee"),
    },
    {
      label: "Blacklist",
      href: "/scammer-check",
      icon: ShieldAlert,
      isActive: pathname.startsWith("/scammer-check"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070D18]/95 backdrop-blur-xl border-t border-pitch-border px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] safe-area-pb"
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
                  ? "text-slate-950 font-black"
                  : item.isActive
                  ? "text-emerald-400 bg-pitch-surface/80 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.highlight ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 -mt-1">
                  <Icon className="w-4 h-4 stroke-[2.5] text-slate-950" />
                </div>
              ) : (
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      item.isActive ? "scale-105 stroke-[2.2]" : "stroke-[1.75]"
                    }`}
                  />
                </div>
              )}
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[60px] ${
                  item.highlight ? "font-bold text-emerald-400" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
