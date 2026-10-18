import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("redirect") || "/dashboard/buyer";

  const redirectTarget = next.startsWith("/") ? next : `/${next}`;
  const canonicalOrigin = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin || "https://www.efootballmarket.co.ke";
  const response = NextResponse.redirect(new URL(redirectTarget, canonicalOrigin));

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (token_hash && type) {
      await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });
    }

    // Auto-sync user profile for OAuth sign-ins (e.g. Google)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const metadata = user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || "";
        const nameParts = fullName.split(" ");
        const firstName = metadata.first_name || nameParts[0] || "Trader";
        const lastName = metadata.last_name || nameParts.slice(1).join(" ") || "";
        const baseUsername = (
          metadata.user_name ||
          user.email?.split("@")[0] ||
          `trader_${user.id.slice(0, 6)}`
        )
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "");

        await supabase.from("profiles").upsert({
          id: user.id,
          username: baseUsername,
          first_name: firstName,
          last_name: lastName,
          phone_number: metadata.phone_number || "+254700000000",
          country: "KEN",
          is_verified_seller: false,
          available_balance: 0.0,
          escrow_balance: 0.0,
        });

        await supabase.from("user_roles").upsert({
          user_id: user.id,
          role_id: "buyer",
        });
      }
    }
  } catch (err) {
    console.warn("Auth callback session exchange error:", err);
  }

  return response;
}
