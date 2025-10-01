import { getSessionFromCookie } from "@/utils/auth";
import { getUserTeamsAction } from "@/actions/team-actions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Users } from "lucide-react";
import type { Route } from "next";
import { PageHeader } from "@/components/page-header";
import { PendingInvitations } from "./pending-invitations";
import { TeamsPageClient } from "./teams-page-client";

export const metadata = {
  title: "My Teams",
  description: "Manage your teams and collaborations",
};

interface TeamRole {
  name: string;
  id: string;
}

interface TeamItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  creditBalance: number;
  role?: TeamRole;
}

export default async function TeamsIndexPage() {
  // Check if the user is authenticated
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in?redirect=/teams");
  }

  // Get teams data
  const [result, error] = await getUserTeamsAction();

  let teams: TeamItem[] = [];
  const typedResult = result as { success?: boolean, data?: TeamItem[] } | undefined;
  if (typedResult?.success && typedResult.data) {
    teams = typedResult.data;
  }

  if (error) {
    return notFound();
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/teams",
            label: "Teams"
          }
        ]}
      />
      {/* Show pending invitations */}
      <PendingInvitations />
      
      <TeamsPageClient teams={teams} />
    </>
  );
}
