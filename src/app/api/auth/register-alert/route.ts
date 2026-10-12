import { NextRequest, NextResponse } from "next/server";
import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, email, phoneNumber } = await req.json();

    // Fire automated WhatsApp alert to Brian Okibo (+254794400365)
    await dispatchAdminWhatsAppAlert({
      eventType: "NEW_USER_REGISTERED",
      username: username || "New Gamer",
      userEmail: email || "",
      buyerPhone: phoneNumber || "",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn("Register WhatsApp alert non-blocking error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
