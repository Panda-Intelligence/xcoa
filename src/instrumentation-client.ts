'use client'

// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

type RouterTransitionHandler = (context?: unknown) => void;

let routerTransitionHandler: RouterTransitionHandler = () => {};

async function initSentryClient() {
  try {
    const Sentry = await import("@sentry/react");

    const integrations: unknown[] = [];
    const replayIntegration = (Sentry as unknown as { replayIntegration?: () => unknown }).replayIntegration;
    if (typeof replayIntegration === "function") {
      integrations.push(replayIntegration());
    }

    Sentry.init({
      dsn: "https://a5628f1997f0695e142e0a46d1a25bda@o4508391005356032.ingest.us.sentry.io/4510214264193024",
      integrations,
      tracesSampleRate: 1,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      sendDefaultPii: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Sentry client initialization failed:", error);
    }
  }
}

if (typeof window !== "undefined") {
  void initSentryClient();
}

export const onRouterTransitionStart: RouterTransitionHandler = (context?: unknown) =>
  routerTransitionHandler(context);
