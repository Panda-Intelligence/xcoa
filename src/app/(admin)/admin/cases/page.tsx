import { requireAdmin } from "@/utils/auth";
import { AdminCasesManager } from "../_components/cases/admin-cases-manager";

export default async function AdminCasesPage() {
  await requireAdmin();

  return <AdminCasesManager />;
}