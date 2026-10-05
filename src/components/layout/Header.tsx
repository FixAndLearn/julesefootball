"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  PlusCircle,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
  X,
  Sparkles,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const { user, profile, loading, signOut, isAuthenticated, displayName } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pitch-border/80 bg-pitch/90 backdrop-blur-xl transition-all">
      {/* Contextual Guest Guidance Ribbon */}
      {!isAuthenticated && !loading && !dismissedBanner && (
        <div className="bg-gradient-to-r from-brand-950/90 via-slate-900 to-amber-950/80 border-b border-pitch-border/60 px-4 py-1.5 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="truncate">
                <span className="font-semibold text-amber-300">New Trader?</span> Create a free account or log in to buy & sell eFootball accounts with M-Pesa escrow protection.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Log In
              </Link>
              <span className="text-slate-600">•</span>
              <Link
                href="/register"
                className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
              >
                Create Account
              </Link>
              <button
                type="button"
                onClick={() => setDismissedBanner(true)}
                className="text-slate-400 hover:text-slate-200 ml-1"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

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
              <Link
                href="/escrow-guarantee"
                className="hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Escrow Protection
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/seller/create-listing">
              <Button variant="gold" size="sm" className="hidden sm:inline-flex items-center gap-1.5 font-semibold">
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

            {/* Interactive Notification Bell with Live Unread Popover */}
            <NotificationBell />


            <div className="h-6 w-px bg-pitch-border mx-1 hidden sm:block" />

            {/* Authenticated User Profile Menu OR Guest Actions */}
            {loading ? (
              <div className="h-9 w-24 bg-pitch-surface animate-pulse rounded-lg hidden sm:block" />
            ) : isAuthenticated ? (
              /* Logged In User Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-pitch-surface border border-pitch-border hover:border-amber-400/60 hover:bg-pitch-card transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-brand-600 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(displayName)}
                  </div>
                  <span className="text-xs font-bold text-slate-100 max-w-[110px] truncate hidden sm:inline-block">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-pitch-surface border border-pitch-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2.5 border-b border-pitch-border/60">
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      {profile?.is_verified_seller && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Seller</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/dashboard/buyer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-card transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-brand-400" />
                        <span>Buyer Dashboard & Orders</span>
                      </Link>

                      <Link
                        href="/dashboard/seller"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-card transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Seller Hub & Earnings</span>
                      </Link>

                      <Link
                        href="/seller/create-listing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-card transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Create New Listing</span>
                      </Link>

                      <Link
                        href="/seller/verification"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-card transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        <span>Seller KYC Verification</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-pitch-border/60">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Actions (Log In + Create Account) */
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    <UserIcon className="w-4 h-4 mr-1.5" />
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gold" size="sm" className="font-semibold shadow-md">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Create Account
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-surface transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pitch-border bg-pitch-surface/95 backdrop-blur-xl px-4 py-5 space-y-4">
          {/* User profile card or guest action on mobile */}
          {isAuthenticated ? (
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-brand-600 text-slate-950 font-bold text-sm flex items-center justify-center">
                  {getInitials(displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/dashboard/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-1.5 rounded-lg bg-pitch-surface border border-pitch-border text-slate-200"
                >
                  Buyer Hub
                </Link>
                <Link
                  href="/dashboard/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-1.5 rounded-lg bg-pitch-surface border border-pitch-border text-slate-200"
                >
                  Seller Hub
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border space-y-3">
              <div>
                <p className="text-xs font-bold text-white">Join eFootballMarket</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sign in or create an account to trade verified squads with M-Pesa escrow protection.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gold" size="sm" className="w-full text-xs font-semibold">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <nav className="space-y-1 text-sm font-medium text-slate-300">
            <Link
              href="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-pitch-card hover:text-white"
            >
              <span>Notifications</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </Link>
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-pitch-card hover:text-white"
            >
              Browse Accounts
            </Link>

            <Link
              href="/browse?playstyle=quick_counter"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-pitch-card hover:text-white"
            >
              Quick Counter Squads
            </Link>
            <Link
              href="/browse?minStrength=3100"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-pitch-card hover:text-white"
            >
              OVR 3100+ Squads
            </Link>
            <Link
              href="/escrow-guarantee"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-pitch-card hover:text-white"
            >
              Escrow Protection Guarantee
            </Link>
            <Link
              href="/seller/create-listing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-pitch-card text-amber-400 font-semibold"
            >
              + Sell an Account
            </Link>
          </nav>

          {isAuthenticated && (
            <div className="pt-2 border-t border-pitch-border">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
