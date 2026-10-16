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
  FileText,
  LogOut,
  Menu,
  MessageCircle,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Trophy,
  User as UserIcon,
  X,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut, isAuthenticated, displayName } = useAuth();
  const isAdminUser = isUserAdmin(user?.email, profile?.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

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

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-header shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Desktop Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Logo clickable={true} size="md" />

            {/* Public Community Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm font-medium">
              <Link
                href="/tournaments"
                className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isNavActive("/tournaments")
                    ? "bg-[#111827] text-[#F8FAFC] border border-[#1F2937]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]"
                }`}
              >
                <Trophy className="w-4 h-4 text-[#FBBF24]" />
                <span>Tournaments</span>
              </Link>

              <Link
                href="/news"
                className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isNavActive("/news")
                    ? "bg-[#111827] text-[#F8FAFC] border border-[#1F2937]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]"
                }`}
              >
                <Newspaper className="w-4 h-4 text-[#94A3B8]" />
                <span>News & Alerts</span>
              </Link>

              <Link
                href="/fraud-prevention"
                className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isNavActive("/fraud-prevention")
                    ? "bg-[#111827] text-[#F8FAFC] border border-[#1F2937]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
                <span>Safety Guide</span>
              </Link>

              <Link
                href="/terms"
                className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isNavActive("/terms")
                    ? "bg-[#111827] text-[#F8FAFC] border border-[#1F2937]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]"
                }`}
              >
                <FileText className="w-4 h-4 text-[#94A3B8]" />
                <span>Rules</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Elements */}
          <div className="flex items-center gap-3">
            {/* Direct Community Helpline / WhatsApp */}
            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              title="Official Community Support: 0794400365"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>0794400365</span>
            </a>

            {/* Notification Bell */}
            <NotificationBell />

            <div className="h-5 w-px bg-[#1F2937] mx-0.5 hidden sm:block" />

            {/* Auth State / Profile Menu */}
            {loading ? (
              <div className="h-9 w-20 bg-[#111827] animate-pulse rounded-lg hidden sm:block" />
            ) : isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#FBBF24]/60 hover:bg-[#1F2937] transition-all min-h-[40px]"
                  aria-expanded={dropdownOpen}
                  aria-label="User Account Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FBBF24] to-[#22C55E] text-[#0B1220] font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(displayName)}
                  </div>
                  <span className="text-xs font-bold text-[#F8FAFC] max-w-[100px] truncate hidden sm:inline-block">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2.5 border-b border-[#1F2937]">
                      <p className="text-xs font-bold text-[#F8FAFC] truncate">{displayName}</p>
                      <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
                      {profile?.is_verified_seller && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Member</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/dashboard/buyer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-[#FBBF24]" />
                        <span>Member Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard/seller"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                        <span>Organizer & Activity Hub</span>
                      </Link>

                      {isAdminUser && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/30 hover:bg-[#FBBF24]/20 font-bold transition-colors my-1"
                        >
                          <Crown className="w-4 h-4 text-[#FBBF24]" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#1F2937]">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors min-h-[36px]"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Sign In Action */
              <div className="hidden sm:flex items-center">
                <Link href="/login">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all min-h-[40px]"
                  >
                    <UserIcon className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1F2937] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#0B1220]/95 backdrop-blur-xl px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User profile card or guest action on mobile */}
          {isAuthenticated ? (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#FBBF24] to-[#22C55E] text-[#0B1220] font-bold text-sm flex items-center justify-center">
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
                  className="text-center text-xs py-2 rounded-lg bg-[#1F2937] border border-[#374151] text-[#F8FAFC] min-h-[40px] flex items-center justify-center"
                >
                  Member Hub
                </Link>
                <Link
                  href="/dashboard/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-2 rounded-lg bg-[#1F2937] border border-[#374151] text-[#F8FAFC] min-h-[40px] flex items-center justify-center"
                >
                  Activity Hub
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div>
                <p className="text-sm font-bold text-[#F8FAFC]">eFootball Community Kenya</p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Sign in to participate in knockout tournaments, post scores, and connect with local players.
                </p>
              </div>
              <div className="pt-1">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full bg-[#22C55E] text-[#0B1220] font-bold hover:bg-[#16a34a] text-xs py-2.5 min-h-[44px]">
                    Sign In to Community
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Primary Mobile Navigation Links */}
          <nav className="space-y-1 text-sm font-medium text-[#94A3B8]">
            {isAdminUser && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FBBF24] font-bold min-h-[48px]"
              >
                <span>Admin Control Center</span>
                <Crown className="w-4 h-4 text-[#FBBF24]" />
              </Link>
            )}

            <Link
              href="/tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#111827] text-[#F8FAFC] font-semibold min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-[#FBBF24]" />
                <span>Tournaments & Brackets</span>
              </div>
            </Link>

            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#111827] text-[#F8FAFC] min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4 text-[#94A3B8]" />
                <span>News & Game Updates</span>
              </div>
            </Link>

            <Link
              href="/fraud-prevention"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#111827] text-[#F8FAFC] min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
                <span>Fair Play & Safety Guide</span>
              </div>
            </Link>

            <Link
              href="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#111827] text-[#94A3B8] hover:text-[#F8FAFC] min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#94A3B8]" />
                <span>Community Rules & Terms</span>
              </div>
            </Link>

            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#111827] border border-[#1F2937] text-[#F8FAFC] text-xs font-semibold min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>WhatsApp Community Support: 0794400365</span>
              </div>
            </a>
          </nav>

          {isAuthenticated && (
            <div className="pt-2 border-t border-[#1F2937]">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-bold min-h-[44px]"
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
