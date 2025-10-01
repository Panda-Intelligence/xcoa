"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServerAction } from "zsa-react";
import { acceptTeamInviteAction } from "./team-invite.action";
import { teamInviteSchema } from "@/schemas/team-invite.schema";
import { Spinner } from "@/components/ui/spinner";

export default function TeamInviteClientComponent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasCalledAcceptInvite = useRef(false);

  const { execute: handleAcceptInvite, isPending, error } = useServerAction(acceptTeamInviteAction, {
    onError: ({ err }) => {
      toast.dismiss();
      toast.error(err.message || t('auth.teamInvite.failedToAccept'));
    },
    onStart: () => {
      toast.loading(t('auth.teamInvite.processingInvitation'));
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(t('auth.teamInvite.successfullyJoined'));

      router.refresh();

      // Redirect to the team dashboard, with fallback to general dashboard
      setTimeout(() => {
        if (data && typeof data === 'object' && 'teamId' in data) {
          router.push(`/teams/${data.teamId}`);
        } else if (data && typeof data === 'object' && data.data && 'teamId' in data.data) {
          router.push(`/teams/${data.data.teamId}`);
        } else {
          // Fallback to dashboard if teamId is not found
          router.push('/scales');
        }
      }, 500);
    },
  });

  useEffect(() => {
    if (token && !hasCalledAcceptInvite.current) {
      const result = teamInviteSchema.safeParse({ token });
      if (result.success) {
        hasCalledAcceptInvite.current = true;
        handleAcceptInvite(result.data);
      } else {
        toast.error(t('auth.teamInvite.invalidToken'));
        router.push("/sign-in");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="large" />
              <CardTitle>{t('auth.teamInvite.acceptingInvitation')}</CardTitle>
              <CardDescription>
                {t('auth.teamInvite.pleaseWait')}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth.teamInvite.invitationError')}</CardTitle>
            <CardDescription>
              {error?.message || t('auth.teamInvite.failedToProcess')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {error?.code === "CONFLICT"
                ? t('auth.teamInvite.alreadyMember')
                : error?.code === "FORBIDDEN" && error?.message.includes("limit")
                  ? t('auth.teamInvite.teamLimitReached')
                  : t('auth.teamInvite.expiredOrRevoked')}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/scales")}
            >
              {t('auth.teamInvite.goToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth.teamInvite.invalidLink')}</CardTitle>
            <CardDescription>
              {t('auth.teamInvite.linkInvalidOrExpired')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/scales")}
            >
              {t('auth.teamInvite.goToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
