import { requireAdmin } from "@/utils/auth";
import { AdminInvoiceDetail } from "../../_components/invoices/admin-invoice-detail";

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { invoiceId } = await params;

  return <AdminInvoiceDetail invoiceId={invoiceId} />;
}