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
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { LiveActivityMarquee } from "@/components/layout/LiveActivityMarquee";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Globe, Flame, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const { user, profile, loading, signOut, isAuthenticated, displayName } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isAdminUser = isUserAdmin(user?.email, profile?.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
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
      {/* 1. Top Live Activity Marquee Ticker */}
      <LiveActivityMarquee />

      {/* 2. Persistent Global Authority Trust Ribbon */}
      <div className="bg-[#090D16] border-b border-[#1F2937]/80 py-1.5 px-3 sm:px-4 text-[11px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[#94A3B8] gap-3">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-[#22C55E] font-semibold shrink-0">
              <BadgeCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Safaricom Till 1572931</span>
            </span>
            <span className="text-slate-600 shrink-0">•</span>
            <span className="inline-flex items-center gap-1 text-slate-300 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>24H Buyer Inspection</span>
            </span>
            <span className="text-slate-600 hidden lg:inline shrink-0">•</span>
            <span className="hidden lg:inline text-slate-400 shrink-0">
              Kenya DPA (2019) Compliant
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium shrink-0">
            <a
              href="https://wa.me/254794400365"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22C55E] hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>0794400365</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">KES (M-Pesa)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-4 xl:gap-8 min-w-0">
            <Logo clickable={true} size="md" />

            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium">
              <Link
                href="/browse"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap shrink-0"
              >
                {t.browseSquads}
              </Link>
              <Link
                href="/#friday-drops"
                className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 flex items-center gap-1.5 transition-colors font-medium whitespace-nowrap shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t.fridayDrops}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-mono font-bold text-amber-300">
                  DROP
                </span>
              </Link>
              <Link
                href="/escrow-guarantee"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap shrink-0"
              >
                {t.escrowGuide}
              </Link>
              <Link
                href="/scammer-check"
                className="px-3 py-1.5 rounded-lg text-rose-300/90 hover:text-rose-200 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors font-medium whitespace-nowrap shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{t.scammerCheck}</span>
              </Link>
              <Link
                href="/news"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap shrink-0"
              >
                {t.communityBulletin}
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="relative shrink-0" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                title="Change language / Badilisha lugha"
              >
                <Globe className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span className="font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  {language === "en" ? "EN" : "SW"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#111827] border border-[#1F2937] shadow-xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("en");
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#1F2937] transition-colors ${
                      language === "en" ? "text-[#22C55E] font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>English</span>
                    {language === "en" && <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("sw");
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#1F2937] transition-colors ${
                      language === "sw" ? "text-[#22C55E] font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>Kiswahili</span>
                    {language === "sw" && <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Prominent Sell Account CTA */}
            <Link href="/seller/create-listing" className="hidden sm:inline-flex shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-[#22C55E] to-emerald-400 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                <span className="whitespace-nowrap">{t.sellAccount}</span>
              </Button>
            </Link>

            {/* Interactive Notification Bell */}
            <NotificationBell />

            <div className="h-5 w-px bg-slate-800 mx-0.5 hidden sm:block shrink-0" />

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
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="secondary" size="sm" className="bg-[#111827] border-[#1F2937] text-[#F8FAFC] hover:bg-[#1F2937] text-xs font-semibold px-3 py-1.5 rounded-lg">
                    <UserIcon className="w-3.5 h-3.5 mr-1 text-[#94A3B8]" />
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="bg-[#1F2937] border border-[#374151] hover:border-[#FBBF24]/60 text-[#FBBF24] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-[#FBBF24]" />
                    Register
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
        <div className="lg:hidden border-t border-[#1F2937] bg-[#0B1220]/95 backdrop-blur-xl px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
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

            {/* Mobile Language Selector */}
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#22C55E]" />
                <span>Language:</span>
              </span>
              <div className="flex items-center gap-1">
                {(["en", "sw"] as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                      language === l
                        ? "bg-[#22C55E] text-[#0B1220]"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
            >
              <span>{t.browseSquads}</span>
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
            </Link>

            <Link
              href="/#friday-drops"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold"
            >
              <span>{t.fridayDrops}</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </Link>

            <Link
              href="/scammer-check"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold"
            >
              <span>{t.scammerCheck}</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </Link>

            <Link
              href="/escrow-guarantee"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
            >
              <span>{t.escrowGuide}</span>
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            </Link>

            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
            >
              <span>{t.communityBulletin}</span>
              <Newspaper className="w-4 h-4 text-[#94A3B8]" />
            </Link>

            <Link
              href="/middleman"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#22C55E] font-semibold"
            >
              <span>Bring-Your-Own-Deal Middleman</span>
              <Handshake className="w-4 h-4 text-[#22C55E]" />
            </Link>

            <Link
              href="/tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
            >
              <span>Tournaments & Brackets</span>
              <Trophy className="w-4 h-4 text-[#FBBF24]" />
            </Link>

            <Link
              href="/wanted"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#111827] text-[#F8FAFC]"
            >
              <span>Wanted Squads (Buyer Requests)</span>
              <Target className="w-4 h-4 text-[#FBBF24]" />
            </Link>

            <Link
              href="/seller/create-listing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-400 text-[#0B1220] font-black text-xs shadow-lg shadow-emerald-950/40"
            >
              <span>{t.sellAccount}</span>
              <PlusCircle className="w-4 h-4 stroke-[3]" />
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
              <span>WhatsApp Support: 0794400365</span>
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
