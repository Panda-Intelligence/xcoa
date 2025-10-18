"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Users } from "lucide-react";
import type { Route } from "next";
import { useLanguage } from "@/hooks/useLanguage";

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

interface TeamsPageClientProps {
  teams: TeamItem[];
}

export function TeamsPageClient({ teams }: TeamsPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-5 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{t("team.my_teams", "My Teams")}</h1>
          <p className="text-muted-foreground mt-2">{t("team.manage_teams_description", "Manage your teams and collaborations")}</p>
        </div>
        <Button asChild>
          <Link href={"/teams/create" as Route}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("team.create_team", "Create Team")}
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="border-dashed border">
          <CardHeader>
            <CardTitle className="text-xl">{t("team.no_teams_yet", "You don't have any teams yet")}</CardTitle>
            <CardDescription>
              {t("team.teams_collaboration_description", "Teams let you collaborate with others on projects and share resources.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Users className="h-16 w-16 text-muted-foreground/50" />
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button asChild>
              <Link href={"/teams/create" as Route}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {t("team.create_first_team", "Create your first team")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.slug}` as Route}>
              <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-4">
                  {team.avatarUrl ? (
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={team.avatarUrl}
                        alt={`${team.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                      <Users className="h-6 w-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <CardTitle>{team.name}</CardTitle>
                    {team.role && (
                      <CardDescription>
                        {t("team.your_role", "Your role")}: <span className="capitalize">{team.role.name}</span>
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-muted-foreground">
                    {team.description || t("team.no_description", "No description provided")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}