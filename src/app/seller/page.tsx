import { redirect } from "next/navigation";

export default function SellerPageRedirect() {
  redirect("/dashboard/seller");
}
