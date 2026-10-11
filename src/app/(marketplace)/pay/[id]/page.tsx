import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { DirectCheckoutForm } from "@/components/marketplace/DirectCheckoutForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 0;

interface DirectPayPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: DirectPayPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);
  const listing = await listingService.getListingById(params.id);

  if (!listing) {
    return { title: "Direct Checkout | eFootballMarket" };
  }

  return {
    title: `Instant M-Pesa Checkout: ${listing.title} | eFootballMarket`,
    description: `Pay KES ${listing.price.toLocaleString()} securely via Till 1572931 escrow for ${listing.title}. 100% scam-proof Konami ID transfer.`,
  };
}

export default async function DirectPayPage({ params }: DirectPayPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  const listingService = new ListingService(supabase);
  const listing = await listingService.getListingById(params.id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <DirectCheckoutForm
        listing={listing}
        currentUserId={user?.id}
        currentUserPhone={profile?.phone_number || ""}
        currentUserName={profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : profile?.username || ""}
      />
    </div>
  );
}
