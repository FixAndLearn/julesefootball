"use client";

import { Button } from "@/components/ui/Button";
import { Bell, ShieldCheck, ShoppingCart, User, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pitch-border/80 bg-pitch/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-konami-blue flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-display">
                  eFootball<span className="text-brand-400">Market</span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1">
                  Escrow Protected
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link href="/browse" className="hover:text-white transition-colors">
                Browse Accounts
              </Link>
              <Link href="/browse?playstyle=quick_counter" className="hover:text-white transition-colors">
                Quick Counter
              </Link>
              <Link href="/browse?minStrength=3100" className="hover:text-white transition-colors">
                OVR 3100+
              </Link>
              <Link href="/escrow-guarantee" className="hover:text-brand-300 flex items-center gap-1 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Escrow Protection
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/seller/create-listing">
              <Button variant="gold" size="sm" className="hidden sm:inline-flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                Sell Account
              </Button>
            </Link>

            <Link href="/dashboard/buyer">
              <button
                type="button"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-surface transition-colors relative"
                aria-label="Purchases & Orders"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </Link>

            <Link href="/notifications">
              <button
                type="button"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-surface transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
            </Link>

            <div className="h-6 w-px bg-pitch-border mx-1 hidden sm:block" />

            <Link href="/login">
              <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                <User className="w-4 h-4 mr-1.5" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
