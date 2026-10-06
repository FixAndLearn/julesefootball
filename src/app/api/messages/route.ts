import { detectProhibitedOffPlatformContent } from "@/lib/security/chatFilter";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MessageService } from "@/services/messageService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty"),
  messageType: z.enum(["text", "image", "system", "credential_alert"]).default("text"),
  attachments: z.array(z.object({
    url: z.string(),
    name: z.string(),
    size: z.number(),
  })).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    // Check that user is part of this conversation
    const { data: conversation } = await primaryClient
      .from("conversations")
      .select("id, order_id, orders(buyer_id, seller_id)")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const linkedOrder = (conversation as any).orders;
    const isOrderParty =
      linkedOrder && (linkedOrder.buyer_id === user.id || linkedOrder.seller_id === user.id);

    if (!isOrderParty) {
      // Check membership in conversation_members
      const { data: member } = await primaryClient
        .from("conversation_members")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (!member) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const service = new MessageService(primaryClient);
    const messages = await service.getMessages(conversationId);

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = sendMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { conversationId, content, messageType, attachments } = parsed.data;

    // 1. STRICT ANTI-CIRCUMVENTION CHECK (WHATSAPP, TELEGRAM, LINKS, PHONE NUMBERS)
    // Directly delete/discard the message and send instant warning!
    const filterResult = detectProhibitedOffPlatformContent(content);
    if (filterResult.isBlocked) {
      return NextResponse.json(
        {
          error: "prohibited_content",
          userWarningMessage:
            filterResult.userWarningMessage ||
            "⚠️ Prohibited: Sharing off-platform contacts (WhatsApp, Telegram, links, phone numbers) is strictly not allowed. Your message was blocked and deleted directly.",
          category: filterResult.matchedCategory,
        },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    // 2. FETCH CONVERSATION AND VALIDATE ACCESS & PAYMENT GATE
    const { data: convData, error: convErr } = await primaryClient
      .from("conversations")
      .select("id, order_id, orders(*)")
      .eq("id", conversationId)
      .single();

    if (convErr || !convData) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const order = (convData as any).orders;
    const isBuyer = order && order.buyer_id === user.id;
    const isSeller = order && order.seller_id === user.id;

    if (order && !isBuyer && !isSeller) {
      const { data: member } = await primaryClient
        .from("conversation_members")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (!member) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // 3. M-PESA PAYMENT GATE
    // If order status is still 'payment_pending', buyer must make SDK push before reaching out to seller!
    if (order && order.status === "payment_pending") {
      return NextResponse.json(
        {
          error: "payment_required",
          userWarningMessage:
            "🔒 Lipa Na M-Pesa STK Push payment must be completed before communication with the seller is activated.",
        },
        { status: 403 }
      );
    }

    // 4. PERSIST MESSAGE
    const service = new MessageService(primaryClient);
    const message = await service.sendMessage(
      conversationId,
      user.id,
      content,
      messageType,
      attachments
    );

    // 5. DISPATCH REAL-TIME NOTIFICATION TO RECIPIENT
    let recipientId: string | null = null;
    if (order) {
      recipientId = isBuyer ? order.seller_id : order.buyer_id;
    } else {
      const { data: otherMembers } = await primaryClient
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id)
        .limit(1);

      if (otherMembers && otherMembers.length > 0) {
        recipientId = otherMembers[0].user_id;
      }
    }

    if (recipientId) {
      try {
        const { data: senderProfile } = await primaryClient
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        const senderName = senderProfile?.username || "Trader";
        const title = order
          ? `New Message on Order #${order.order_number}`
          : `New Message from ${senderName}`;
        const preview = content.length > 90 ? content.slice(0, 87) + "..." : content;
        const actionUrl = order ? `/orders/${order.id}` : "/dashboard/buyer";

        await primaryClient.from("notifications").insert({
          recipient_id: recipientId,
          type: "new_message",
          title,
          message: `${senderName}: ${preview}`,
          action_url: actionUrl,
          is_read: false,
        });
      } catch (notifErr) {
        console.warn("Could not dispatch notification for new message:", notifErr);
      }
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
