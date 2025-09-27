import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { InterpretationDetail } from "../../_components/interpretation-detail";

interface PageProps {
  params: Promise<{ scaleId: string }>;
}

export default async function InterpretationDetailPage({ params }: PageProps) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  const { scaleId } = await params;

  return <InterpretationDetail scaleId={scaleId} />;
}