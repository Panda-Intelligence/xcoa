"use client";

import { CreateTeamForm } from "@/components/teams/create-team-form";
import { useLanguage } from "@/hooks/useLanguage";

export function CreateTeamPageClient() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-5 pb-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mt-4">{t("team.create_new_team", "Create a new team")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("team.create_team_description", "Create a team to collaborate with others on projects and share resources.")}
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <CreateTeamForm />
        </div>
      </div>
    </div>
  );
}