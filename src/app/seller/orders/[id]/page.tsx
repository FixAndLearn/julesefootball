import { redirect } from "next/navigation";

interface SellerOrderRedirectProps {
  params: {
    id: string;
  };
}

export default function SellerOrderRedirectPage({ params }: SellerOrderRedirectProps) {
  redirect(`/orders/${params.id}`);
}
