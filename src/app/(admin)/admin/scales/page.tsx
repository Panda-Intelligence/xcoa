import { requireAdmin } from "@/utils/auth";
import { AdminScalesManager } from "../_components/scales/admin-scales-manager";

export default async function AdminScalesPage() {
  await requireAdmin();

  return <AdminScalesManager />;
}