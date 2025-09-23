import { requireAdmin } from "@/utils/auth";
import { AdminScaleDetail } from "../../_components/scales/admin-scale-detail";

interface PageProps {
  params: Promise<{ scaleId: string }>;
}

export default async function AdminScaleDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { scaleId } = await params;

  return <AdminScaleDetail scaleId={scaleId} />;
}