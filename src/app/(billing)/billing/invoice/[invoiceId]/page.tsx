import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { UserInvoiceDetail } from "../../_components/user-invoice-detail";

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function UserInvoiceDetailPage({ params }: PageProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  const { invoiceId } = await params;

  return <UserInvoiceDetail invoiceId={invoiceId} />;
}