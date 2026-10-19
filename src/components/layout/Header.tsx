"use client";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { isUserAdmin } from "@/lib/security/adminAuth";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  LogOut,
  Menu,
  Newspaper,
  Phone,
  PlusCircle,
  Search,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
  X,
  Sparkles,
  Target,
  Handshake,
  Trophy,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { LiveActivityMarquee } from "@/components/layout/LiveActivityMarquee";
import { useLanguage } from "@/context/LanguageContext";
import { Flame, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut, isAuthenticated, displayName } = useAuth();
  const { t } = useLanguage();
  const isAdminUser = isUserAdmin(user?.email, profile?.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreNavRef = useRef<HTMLLIElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setMoreNavOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (moreNavRef.current && !moreNavRef.current.contains(event.target as Node)) {
        setMoreNavOpen(false);
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

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/auth");

  const isHighIntentRoute =
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/pay/") ||
    pathname === "/seller/verification" ||
    pathname === "/seller/create-listing";

  if (isAuthRoute) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#1F2937] bg-[#0B1220]/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo clickable={true} size="md" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1F2937] hover:border-slate-700 bg-slate-900/60 transition-colors"
            >
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  if (isHighIntentRoute) {
    let contextTitle = "Escrow Transaction";
    let backHref = "/";
    let backLabel = "Back to Marketplace";

    if (pathname.startsWith("/orders/")) {
      contextTitle = "Escrow Handover Room (Till 1572931 Protected)";
      backHref = "/dashboard/buyer";
      backLabel = "My Orders";
    } else if (pathname.startsWith("/pay/")) {
      contextTitle = "M-Pesa Escrow Checkout";
      backHref = "/browse";
      backLabel = "Cancel Checkout";
    } else if (pathname === "/seller/create-listing") {
      contextTitle = "Create Squad Listing";
      backHref = "/dashboard/seller";
      backLabel = "Seller Dashboard";
    } else if (pathname === "/seller/verification") {
      contextTitle = "Seller KYC & Verification";
      backHref = "/dashboard/seller";
      backLabel = "Back to Hub";
    }

    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#1F2937] bg-[#0B1220]/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo clickable={true} size="md" />
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{contextTitle}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={backHref}
              className="text-xs font-semibold text-[#94A3B8] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1F2937] hover:border-slate-700 bg-slate-900/60 transition-colors"
            >
              <span>{backLabel}</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/20 bg-[#070D18]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all">
      {/* Top Live Activity Marquee Ticker */}
      <LiveActivityMarquee />

      {/* Subtle Luminous Stadium Floodlight Accent Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/40 via-amber-400/30 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-4 xl:gap-6">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0">
            <Logo clickable={true} size="md" />

            <nav role="navigation" aria-label="Main Navigation" className="hidden lg:block shrink-0">
              <ul role="menubar" className="flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium">
                <li role="none">
                  <Link
                    href="/browse"
                    role="menuitem"
                    title="Browse Verified eFootball Mobile Accounts Kenya"
                    className="px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                  >
                    {t.browseSquads}
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href="/escrow-guarantee"
                    role="menuitem"
                    title="Safaricom Till 1572931 Escrow Protection Guarantee"
                    className="px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                  >
                    {t.escrowGuide}
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href="/scammer-check"
                    role="menuitem"
                    title="Live Kenyan Scammer Blacklist Directory"
                    className="px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-colors whitespace-nowrap"
                  >
                    {t.scammerCheck}
                  </Link>
                </li>

                {/* More Dropdown (Market Bulletin, Friday Drops, Wanted Board, Tournaments) */}
                <li
                  role="none"
                  className="relative"
                  ref={moreNavRef}
                  onMouseEnter={() => setMoreNavOpen(true)}
                  onMouseLeave={() => setMoreNavOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setMoreNavOpen(!moreNavOpen)}
                    className="flex items-center gap-1 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                    title="More marketplace categories"
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${moreNavOpen ? "rotate-180 text-white" : ""}`} />
                  </button>

                  {moreNavOpen && (
                    <div className="absolute left-0 mt-1 w-52 rounded-xl bg-[#0F172A] border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs font-medium">
                      <Link
                        href="/news"
                        onClick={() => setMoreNavOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                      >
                        <Newspaper className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{t.communityBulletin}</span>
                      </Link>
                      <Link
                        href="/friday-drops"
                        onClick={() => setMoreNavOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800/70 transition-colors"
                      >
                        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{t.fridayDrops}</span>
                      </Link>
                      <div className="my-1 border-t border-slate-800/80" />
                      <Link
                        href="/wanted"
                        onClick={() => setMoreNavOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-emerald-300 hover:bg-slate-800/70 transition-colors"
                      >
                        <Target className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Wanted Board</span>
                      </Link>
                      <Link
                        href="/tournaments"
                        onClick={() => setMoreNavOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800/70 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Tournaments</span>
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
            {/* Prominent Sell Account CTA */}
            <Link href="/seller/create-listing" className="hidden sm:inline-flex shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs px-3 xl:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all shrink-0 border border-emerald-400/30"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">{t.sellAccount}</span>
                <span className="xl:hidden whitespace-nowrap">Sell</span>
              </Button>
            </Link>

            {/* Interactive Notification Bell */}
            <NotificationBell />

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block shrink-0" />

            {/* Authenticated User Profile Menu OR Guest Actions */}
            {loading ? (
              <div className="h-9 w-24 bg-[#111827] animate-pulse rounded-lg hidden sm:block shrink-0" />
            ) : isAuthenticated ? (
              /* Logged In User Dropdown */
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all whitespace-nowrap"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FBBF24] to-[#22C55E] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(displayName)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] xl:max-w-[140px] truncate hidden sm:inline-block whitespace-nowrap">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2.5 border-b border-[#1F2937]">
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                      <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
                      {profile?.is_verified_seller && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Seller</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/dashboard/buyer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-[#FBBF24]" />
                        <span>Buyer Hub & Orders</span>
                      </Link>

                      <Link
                        href="/dashboard/seller"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                        <span>Seller Hub & Earnings</span>
                      </Link>

                      <Link
                        href="/seller/create-listing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-[#22C55E]" />
                        <span>Create New Listing</span>
                      </Link>

                      {isAdminUser && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/30 hover:bg-[#FBBF24]/20 font-bold transition-colors my-1"
                        >
                          <Crown className="w-4 h-4 text-[#FBBF24]" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        href="/seller/verification"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        <span>Seller Verification</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-brand-400" />
                        <span>Profile &amp; Security Settings</span>
                      </Link>

                      <Link
                        href="/invite"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-colors"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Invite Friends &amp; Traders</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-[#1F2937]">
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
              /* Guest Actions (Log In & Create Account) */
              <div className="hidden sm:flex items-center gap-1.5 xl:gap-2 shrink-0">
                <Link href="/login" className="shrink-0">
                  <Button variant="secondary" size="sm" className="bg-[#0B1528] border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400 text-xs font-semibold px-2.5 xl:px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-colors">
                    <UserIcon className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    <span>Log In</span>
                  </Button>
                </Link>
                <Link href="/register" className="shrink-0">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black px-2.5 xl:px-3 py-1.5 rounded-xl shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0 border border-amber-300/40 transition-all">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-950" />
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-500/20 bg-[#070D18]/98 backdrop-blur-2xl px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User profile card or guest action on mobile */}
          {isAuthenticated ? (
            <div className="p-3 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
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
                <p className="text-xs font-bold text-[#F8FAFC]">Join eFootballMarket Kenya</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Sign in or create an account to buy, sell, or compete with M-Pesa escrow protection.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full bg-[#1F2937] border border-[#374151] text-[#F8FAFC] text-xs">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full bg-[#22C55E] text-[#0B1220] font-bold hover:bg-[#16a34a] text-xs">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Mobile Instant Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search squads (e.g. 3150 OVR, Epics)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#22C55E]"
            />
          </form>

          <nav role="navigation" aria-label="Mobile Navigation">
            <ul className="space-y-1 text-sm font-medium text-[#94A3B8]">
              {isAdminUser && (
                <li>
                  <Link
                    href="/admin"
                    title="Admin Control Dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#FBBF24] font-bold"
                  >
                    <span>Admin Control Center</span>
                    <Crown className="w-4 h-4 text-[#FBBF24]" />
                  </Link>
                </li>
              )}


              <li>
                <Link
                  href="/browse"
                  title="Browse Verified eFootball Mobile Accounts Kenya"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
                >
                  <span>{t.browseSquads}</span>
                  <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/friday-drops"
                  title="Friday Flash Drops - Up to 35% OFF Accounts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold"
                >
                  <span>{t.fridayDrops}</span>
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                </Link>
              </li>

              <li>
                <Link
                  href="/scammer-check"
                  title="Live Kenyan Scammer Blacklist Directory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold"
                >
                  <span>{t.scammerCheck}</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </Link>
              </li>

              <li>
                <Link
                  href="/escrow-guarantee"
                  title="Safaricom Till 1572931 Escrow Guarantee"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
                >
                  <span>{t.escrowGuide}</span>
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/news"
                  title="eFootball Community News & Patch Notes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
                >
                  <span>{t.communityBulletin}</span>
                  <Newspaper className="w-4 h-4 text-[#94A3B8]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/middleman"
                  title="Bring-Your-Own-Deal Middleman Escrow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#22C55E] font-semibold"
                >
                  <span>Bring-Your-Own-Deal Middleman</span>
                  <Handshake className="w-4 h-4 text-[#22C55E]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/tournaments"
                  title="Competitive eFootball Tournaments Kenya"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
                >
                  <span>Tournaments & Brackets</span>
                  <Trophy className="w-4 h-4 text-[#FBBF24]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/wanted"
                  title="Wanted Squads & Formations Buyer Board"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
                >
                  <span>Wanted Squads (Buyer Requests)</span>
                  <Target className="w-4 h-4 text-[#FBBF24]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/seller/create-listing"
                  title="List & Sell Your eFootball Account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-400 text-[#0B1220] font-black text-xs shadow-lg shadow-emerald-950/40"
                >
                  <span>{t.sellAccount}</span>
                  <PlusCircle className="w-4 h-4 stroke-[3]" />
                </Link>
              </li>

              <li>
                <Link
                  href="/notifications"
                  title="Account Notifications & Escrow Alerts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] hover:text-[#F8FAFC]"
                >
                  <span>Notifications</span>
                  <Bell className="w-4 h-4 text-[#94A3B8]" />
                </Link>
              </li>

              <li>
                <a
                  href="https://wa.me/254794400365"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  title="Contact WhatsApp Escrow Desk Support"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-[#F8FAFC] text-xs font-semibold"
                >
                  <span>WhatsApp Support: 0794400365</span>
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </a>
              </li>
            </ul>
          </nav>

          {isAuthenticated && (
            <div className="pt-2 border-t border-[#1F2937] space-y-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-white text-xs font-semibold"
              >
                <span>Profile &amp; Security Settings</span>
                <UserIcon className="w-4 h-4 text-brand-400" />
              </Link>

              <Link
                href="/invite"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-white text-xs font-semibold"
              >
                <span>Invite Friends &amp; Traders</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </Link>

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
