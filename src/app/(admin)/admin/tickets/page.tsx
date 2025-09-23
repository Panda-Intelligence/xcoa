import { requireAdmin } from "@/utils/auth";
import { AdminTicketsManager } from "../_components/tickets/admin-tickets-manager";

export default async function AdminTicketsPage() {
  await requireAdmin();

  return <AdminTicketsManager />;
}