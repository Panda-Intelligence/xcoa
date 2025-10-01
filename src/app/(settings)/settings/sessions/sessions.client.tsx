"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useServerAction } from "zsa-react";
import { deleteSessionAction } from "./sessions.actions";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SessionWithMeta } from "@/types";
import { capitalize } from 'remeda'
import { useLanguage } from "@/hooks/useLanguage";


const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function SessionsClient({ sessions }: { sessions: SessionWithMeta[] }) {
  const router = useRouter();
  const dialogCloseRef = React.useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const { execute: deleteSession } = useServerAction(deleteSessionAction, {
    onSuccess: () => {
      toast.success(t("settings.session_deleted"));
      dialogCloseRef.current?.click();
      router.refresh();
    }
  });

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className={cn(!session.isCurrentSession ? "bg-card/40" : "border-3 border-primary/20 shadow-lg bg-secondary/30")}>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {session.city && session.country
                      ? `${session.city}, ${regionNames.of(session.country)}`
                      : session.country || t("settings.unknown_location")}
                    {session.isCurrentSession && <Badge>{t("settings.current_session")}</Badge>}
                  </CardTitle>
                  {session?.authenticationType && (
                    <Badge variant='outline'>
                      {t("settings.authenticated_with")} {capitalize(session?.authenticationType ?? "password")?.replace("-", " ")}
                    </Badge>
                  )}
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    &nbsp;· &nbsp;{formatDistanceToNow(session.createdAt)} {t("settings.ago")}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {session.parsedUserAgent?.browser.name ?? t("settings.unknown_browser")} {session.parsedUserAgent?.browser.major ?? t("settings.unknown_version")} {t("settings.on")} {session.parsedUserAgent?.device.vendor ?? t("settings.unknown_device")} {session.parsedUserAgent?.device.model ?? t("settings.unknown_model")} {session.parsedUserAgent?.device.type ?? t("settings.unknown_type")} ({session.parsedUserAgent?.os.name ?? t("settings.unknown_os")} {session.parsedUserAgent?.os.version ?? t("settings.unknown_version")})
                </CardDescription>
              </div>
              <div>
                {!session?.isCurrentSession && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="w-full sm:w-auto">{t("settings.delete_session")}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("settings.delete_session_confirm_title")}</DialogTitle>
                        <DialogDescription>
                          {t("settings.delete_session_confirm_description")}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-6 sm:mt-0">
                        <DialogClose ref={dialogCloseRef} asChild>
                          <Button variant="outline">{t("common.cancel")}</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          className="mb-4 sm:mb-0"
                          onClick={() => deleteSession({ sessionId: session.id })}
                        >
                          {t("settings.delete_session")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
