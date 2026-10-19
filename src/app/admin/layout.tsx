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

import { AdminSidebar } from "@/components/admin/AdminSidebar";

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

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col lg:flex-row">
      {/* Interactive Admin Sidebar */}
      <AdminSidebar userEmail={user.email!} />

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 bg-[#070D18] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
