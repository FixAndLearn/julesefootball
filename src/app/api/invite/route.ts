import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendUserInvitationEmail } from "@/lib/notifications/emailAlert";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toEmail, personalMessage, inviteCode: providedCode } = body;

    if (!toEmail || !toEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

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
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let inviterName = "An eFootball Market Trader";
    let inviteCode = providedCode || "EFOOTBALL2026";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, username")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        inviterName = profile.first_name
          ? `${profile.first_name} ${profile.last_name || ""}`.trim()
          : profile.username || "eFootball Trader";
        inviteCode = profile.username || user.id.slice(0, 8);
      }
    }

    const canonicalAppUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";
    const inviteUrl = `${canonicalAppUrl}/invite?ref=${encodeURIComponent(inviteCode)}`;

    const result = await sendUserInvitationEmail({
      toEmail: toEmail.trim(),
      inviterName,
      inviteCode,
      inviteUrl,
      personalMessage: personalMessage?.trim() || undefined,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error || "Failed to deliver invitation email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation successfully sent to ${toEmail.trim()}!`,
      inviteUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
