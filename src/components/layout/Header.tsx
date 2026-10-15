"use client";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { isUserAdmin } from "@/lib/security/adminAuth";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  Newspaper,
  PlusCircle,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
  X,
  Sparkles,
  Target,
  Handshake,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const { user, profile, loading, signOut, isAuthenticated, displayName } = useAuth();
  const isAdminUser = isUserAdmin(user?.email, profile?.role);
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
    <header className="sticky top-0 z-50 w-full border-b border-[#1F2937] bg-[#0B1220]/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Logo clickable={true} size="md" />

            <nav className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm font-medium">
              <Link
                href="/tournaments"
                className="px-3.5 py-1.5 rounded-lg text-[#F8FAFC] hover:bg-[#111827] flex items-center gap-1.5 transition-colors font-medium"
              >
                <Trophy className="w-4 h-4 text-[#FBBF24]" />
                <span>Tournaments</span>
              </Link>
              <Link
                href="/news"
                className="px-3.5 py-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] flex items-center gap-1.5 transition-colors"
              >
                <Newspaper className="w-4 h-4 text-[#94A3B8]" />
                <span>News & Alerts</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              title="Official Community Support: 0794400365"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Community: 0794400365</span>
            </a>

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

                      {isAdminUser && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 font-bold transition-colors my-1"
                        >
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        href="/seller/verification"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-pitch-card transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        <span>Seller Verification</span>
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
              /* Single Guest Action (Log In) */
              <div className="hidden sm:flex items-center">
                <Link href="/login">
                  <Button variant="secondary" size="sm" className="bg-[#111827] border-[#1F2937] text-[#F8FAFC] hover:bg-[#1F2937] text-xs font-semibold px-3.5 py-1.5 rounded-lg">
                    <UserIcon className="w-3.5 h-3.5 mr-1.5 text-[#94A3B8]" />
                    Log In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#0B1220]/95 backdrop-blur-xl px-4 py-5 space-y-4">
          {/* User profile card or guest action on mobile */}
          {isAuthenticated ? (
            <div className="p-3 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#1F2937] border border-[#374151] text-[#F8FAFC] font-bold text-sm flex items-center justify-center">
                  {getInitials(displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#F8FAFC] truncate">{displayName}</p>
                  <p className="text-xs text-[#94A3B8] truncate">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/dashboard/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-1.5 rounded-lg bg-[#1F2937] border border-[#374151] text-[#F8FAFC]"
                >
                  Buyer Hub
                </Link>
                <Link
                  href="/dashboard/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-1.5 rounded-lg bg-[#1F2937] border border-[#374151] text-[#F8FAFC]"
                >
                  Seller Hub
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div>
                <p className="text-xs font-bold text-[#F8FAFC]">eFootball Community Kenya</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Sign in to participate in tournaments, post match results, and track community rankings.
                </p>
              </div>
              <div>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full bg-[#22C55E] text-[#0B1220] font-bold hover:bg-[#16a34a] text-xs">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <nav className="space-y-1 text-sm font-medium text-[#94A3B8]">
            {isAdminUser && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#FBBF24] font-bold"
              >
                <span>Admin Control Center</span>
                <Crown className="w-4 h-4 text-[#FBBF24]" />
              </Link>
            )}

            <Link
              href="/tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC] font-semibold"
            >
              <span>Tournaments & Brackets</span>
              <Trophy className="w-4 h-4 text-[#FBBF24]" />
            </Link>

            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
            >
              <span>News & Community Alerts</span>
              <Newspaper className="w-4 h-4 text-[#94A3B8]" />
            </Link>

            <Link
              href="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] hover:text-[#F8FAFC]"
            >
              <span>Notifications</span>
              <Bell className="w-4 h-4 text-[#94A3B8]" />
            </Link>

            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-[#F8FAFC] text-xs font-semibold"
            >
              <span>WhatsApp Community: 0794400365</span>
              <MessageCircle className="w-4 h-4 text-[#22C55E]" />
            </a>
          </nav>

          {isAuthenticated && (
            <div className="pt-2 border-t border-[#1F2937]">
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
