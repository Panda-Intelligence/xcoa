import { requireAdmin } from "@/utils/auth";
import { AdminTicketDetail } from "../../_components/tickets/admin-ticket-detail";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function AdminTicketDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { ticketId } = await params;

  return <AdminTicketDetail ticketId={ticketId} />;
}