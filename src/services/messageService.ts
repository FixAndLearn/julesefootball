import { Conversation, Message } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export class MessageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetches an existing conversation for an order, or creates one if it doesn't exist yet.
   */
  async getOrCreateOrderConversation(orderId: string, buyerId: string, sellerId: string): Promise<Conversation> {
    const { data: existing } = await this.supabase
      .from("conversations")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (existing) {
      // Ensure both buyer and seller are recorded in conversation_members
      try {
        const { data: members } = await this.supabase
          .from("conversation_members")
          .select("user_id")
          .eq("conversation_id", existing.id);

        const existingUserIds = new Set((members || []).map((m: any) => m.user_id));
        const missing = [];
        if (!existingUserIds.has(buyerId)) {
          missing.push({ conversation_id: existing.id, user_id: buyerId });
        }
        if (!existingUserIds.has(sellerId)) {
          missing.push({ conversation_id: existing.id, user_id: sellerId });
        }
        if (missing.length > 0) {
          await this.supabase.from("conversation_members").insert(missing);
        }
      } catch {
        // Non-blocking member sync
      }

      return existing as Conversation;
    }

    // Create conversation
    const { data: newConv, error: convError } = await this.supabase
      .from("conversations")
      .insert({
        order_id: orderId,
        conversation_type: "order",
      })
      .select()
      .single();

    if (convError || !newConv) {
      throw new Error(`Failed to create order conversation: ${convError?.message}`);
    }

    // Add members
    await this.supabase.from("conversation_members").insert([
      { conversation_id: newConv.id, user_id: buyerId },
      { conversation_id: newConv.id, user_id: sellerId },
    ]);

    // Send initial system message
    await this.supabase.from("messages").insert({
      conversation_id: newConv.id,
      sender_id: buyerId,
      message_type: "system",
      content: "Secure order conversation initialized. All communications and agreements are logged for buyer & seller escrow protection.",
    });

    return newConv as Conversation;
  }

  /**
   * Retrieves messages for a conversation ordered chronologically.
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to load messages: ${error.message}`);
    }

    return (data as Message[]) || [];
  }

  /**
   * Sends a new message and updates conversation's last_message_at.
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: "text" | "image" | "system" | "credential_alert" = "text",
    attachments: Array<{ url: string; name: string; size: number }> = []
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: messageType,
        content,
        attachments,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to send message: ${error?.message}`);
    }

    // Update conversation timestamp
    await this.supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data as Message;
  }
}
