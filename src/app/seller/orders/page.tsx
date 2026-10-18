import { redirect } from "next/navigation";

export default function SellerOrdersRedirectPage() {
  redirect("/dashboard/seller");
}
