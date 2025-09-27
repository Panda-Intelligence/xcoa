import { requireAdmin } from "@/utils/auth";
import { AdminInvoiceManager } from "../_components/invoices/admin-invoice-manager";

export default async function AdminInvoicesPage() {
  await requireAdmin();

  return <AdminInvoiceManager />;
}