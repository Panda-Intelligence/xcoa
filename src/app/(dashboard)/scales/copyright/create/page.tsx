import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { CopyrightTicketCreate } from "../../_components/copyright-ticket-create";

export default async function CopyrightTicketCreatePage() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  return <CopyrightTicketCreate />;
}