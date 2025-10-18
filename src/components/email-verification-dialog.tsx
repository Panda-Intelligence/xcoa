"use client"

import { useSessionStore } from "@/state/session";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS } from "@/constants";
import isProd from "@/utils/is-prod";
import { usePathname } from "next/navigation";
import { Route } from "next";
import { useLanguage } from "@/hooks/useLanguage";

export function EmailVerificationDialog() {
  const session = useSessionStore((store) => store.session);
  const user = session?.user;
  const pathname = usePathname() as Route;
  const { t } = useLanguage();

  if (!user || user.emailVerified || pathname === "/verify-email") {
    return null;
  }

  const hours = Math.floor(EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS / 3600);

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('auth.email_verification.title')}</DialogTitle>
          <DialogDescription>
            {t('auth.email_verification.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm" dangerouslySetInnerHTML={{
            __html: t('auth.email_verification.sent_to', undefined, { email: user.email })
          }} />

          {!isProd && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>{t('auth.email_verification.dev_mode')}:</strong> {t('auth.email_verification.dev_mode_message')}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              {t('auth.email_verification.resend')}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t('auth.email_verification.expires_in', undefined, { hours })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}