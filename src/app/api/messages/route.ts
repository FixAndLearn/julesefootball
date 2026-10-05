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
    const service = new MessageService(supabase);
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
      return NextResponse.json({ error: "Invalid message payload", details: parsed.error.format() }, { status: 400 });
    }

    const service = new MessageService(supabase);
    const message = await service.sendMessage(
      parsed.data.conversationId,
      user.id,
      parsed.data.content,
      parsed.data.messageType,
      parsed.data.attachments
    );

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
