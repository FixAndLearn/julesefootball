import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderService } from "@/services/orderService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderService = new OrderService(supabase);
    const order = await orderService.getOrderById(params.id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure the requester is either the buyer, the seller, or an admin
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: "Forbidden. You are not a party to this order." }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
