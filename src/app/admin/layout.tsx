import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PRIMARY_SUPER_ADMIN_EMAIL } from "@/lib/security/adminAuth";
import {
  LayoutDashboard,
  Users,
  Layers,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Crown,
  AlertTriangle,
  Banknote,
  Newspaper,
  Send,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Admin Control Center | eFootballMarket Kenya",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated -> Redirect to Login
  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // 2. Role Check
  const isSuperAdminEmail =
    user.email?.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase();

  let hasAdminAccess = isSuperAdminEmail;

  if (!hasAdminAccess) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    hasAdminAccess = role === "admin" || role === "super_admin";
  }

  // 3. Unauthorized -> Redirect to Homepage with 403 Forbidden parameter
  if (!hasAdminAccess) {
    redirect("/?error=unauthorized_admin_access");
  }

  const navItems = [
    { label: "Squad Listings", href: "/admin?tab=listings", icon: Layers },
    { label: "Escrow Disputes", href: "/admin?tab=disputes", icon: AlertTriangle },
    { label: "M-Pesa Payouts", href: "/admin?tab=withdrawals", icon: Banknote },
    { label: "User Directory", href: "/admin?tab=users", icon: Users },
    { label: "Market Bulletins", href: "/admin?tab=news", icon: Newspaper },
    { label: "Telegram Deals Feed", href: "/admin?tab=telegram", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#0D192E] border-r border-[#1C355E] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#1C355E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">
                eFootball Admin
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-wider">
                RBAC ENFORCED
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Operations &amp; Security
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#11213D] border border-transparent hover:border-emerald-500/30 transition-all"
              >
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Administrator Footer & Back link */}
        <div className="p-4 border-t border-[#1C355E] space-y-2 bg-[#091120]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate font-mono text-[11px] text-slate-300">{user.email}</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 pt-1 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 bg-[#070D18] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
