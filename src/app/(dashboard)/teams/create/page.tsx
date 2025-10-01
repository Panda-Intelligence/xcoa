import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { PageHeader } from "@/components/page-header";
import { CreateTeamPageClient } from "./create-team-client";

export const metadata = {
  title: "Create Team",
  description: "Create a new team for your organization",
};

export default async function CreateTeamPage() {
  // Check if the user is authenticated
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in?redirect=/teams/create");
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/teams",
            label: "Teams"
          },
          {
            href: "/teams/create",
            label: "Create Team"
          }
        ]}
      />
      <CreateTeamPageClient />
    </>
  );
}
