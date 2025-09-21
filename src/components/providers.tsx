"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { SessionValidationResult } from "@/types"
import { useSessionStore } from "@/state/session"
import { Suspense, useEffect, useRef, RefObject, useCallback } from "react"
import { useConfigStore } from "@/state/config"
import type { getConfig } from "@/flags"
import { useTopLoader } from 'nextjs-toploader'
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation"
import { useEventListener, useDebounceCallback } from 'usehooks-ts';
import { LanguageProvider } from "@/hooks/useLanguage"

function RouterChecker() {
  const { start, done } = useTopLoader()
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const fetchSession = useSessionStore((store) => store.fetchSession)

  useEffect(() => {
    const _push = router.push.bind(router);
    const _refresh = router.refresh.bind(router);

    router.push = (href, options) => {
      start();
      _push(href, options);
    };

    router.refresh = () => {
      start();
      fetchSession?.();
      _refresh();
    };
  }, [])

  useEffect(() => {
    done();
    fetchSession?.();
  }, [pathname, searchParams, params]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const setSession = useSessionStore((store) => store.setSession)
  const setConfig = useConfigStore((store) => store.setConfig)
  const refetchSession = useSessionStore((store) => store.refetchSession)
  const clearSession = useSessionStore((store) => store.clearSession)
  const documentRef = useRef(typeof window === 'undefined' ? null : document)
  const windowRef = useRef(typeof window === 'undefined' ? null : window)

  const doFetchSession = useCallback(async () => {
    try {
      refetchSession()
      const response = await fetch('/api/get-session')
      const sessionWithConfig = await response.json() as {
        session: SessionValidationResult
        config: Awaited<ReturnType<typeof getConfig>>
      }

      setConfig(sessionWithConfig?.config)

      if (sessionWithConfig?.session) {
        setSession(sessionWithConfig?.session)
      } else {
        clearSession()
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
      clearSession()
    }
  }, [setSession, setConfig, clearSession, refetchSession])

  const fetchSession = useDebounceCallback(doFetchSession, 30)

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  useEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchSession()
    }
  }, documentRef as RefObject<Document>)

  useEventListener('focus', () => {
    fetchSession()
  }, windowRef)

  useEffect(() => {
    useSessionStore.setState({ fetchSession: doFetchSession })
  }, [doFetchSession])

  return (
    <LanguageProvider>
      <Suspense>
        <RouterChecker />
      </Suspense>
      <NextThemesProvider {...props} attribute="class">
        {children}
      </NextThemesProvider>
    </LanguageProvider>
  )
}