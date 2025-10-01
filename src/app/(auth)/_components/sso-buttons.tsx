import { Button } from "@/components/ui/button"
import Link from "next/link";
import { useConfigStore } from "@/state/config";
import Google from "@/icons/google";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";

export default function SSOButtons({
  isSignIn = false
}: {
  isSignIn?: boolean
}) {
  const { t } = useLanguage();
  const { isGoogleSSOEnabled } = useConfigStore()

  if (isGoogleSSOEnabled === null) {
    return (
      <Skeleton className="w-full h-[44px]" />
    )
  }

  return (
    <>
      {isGoogleSSOEnabled && (
        <>
          <Button className="w-full" asChild size='lg'>
            <Link href="/sso/google">
              <Google className="w-[22px] h-[22px] mr-1" />
              {isSignIn ? t('auth.sso.signInWithGoogle') : t('auth.sso.signUpWithGoogle')}
            </Link>
          </Button>
        </>
      )}
    </>
  )
}
