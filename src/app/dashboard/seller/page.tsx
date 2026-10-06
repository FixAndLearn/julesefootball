import { SellerDashboardView } from "@/components/seller/SellerDashboardView";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Listing, Order } from "@/types/database";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function SellerDashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/seller");
  }

  // Fetch seller profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("available_balance, escrow_balance, completed_sales_count, seller_rating, is_verified_seller")
    .eq("id", user.id)
    .single();

  // Fetch seller listings
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Fetch pending orders requiring delivery
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*, listing:listings(title)")
    .eq("seller_id", user.id)
    .eq("status", "escrow_locked");

  const sellerProfile = {
    available_balance: Number(profile?.available_balance || 0),
    escrow_balance: Number(profile?.escrow_balance || 0),
    completed_sales_count: profile?.completed_sales_count || 0,
    seller_rating: Number(profile?.seller_rating || 0),
    is_verified_seller: profile?.is_verified_seller || false,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Seller Control Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account inventory, track escrow balances, and disburse M-Pesa earnings.
        </p>
      </div>

      <SellerDashboardView
        sellerProfile={sellerProfile}
        listings={(listings as Listing[]) || []}
        pendingOrders={(pendingOrders as Order[]) || []}
      />
    </div>
  );
}
