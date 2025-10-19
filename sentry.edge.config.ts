// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// https://docs.sentry.io/platforms/javascript/guides/cloudflare/

import { initSentry } from "./src/lib/sentry-cloudflare";

initSentry({
  dsn: "https://a5628f1997f0695e142e0a46d1a25bda@o4508391005356032.ingest.us.sentry.io/4510214264193024",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
});
