import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { ClinicalCaseDetail } from "../../_components/clinical-case-detail";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default async function ClinicalCaseDetailPage({ params }: PageProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  const { caseId } = await params;

  return <ClinicalCaseDetail caseId={caseId} />;
}