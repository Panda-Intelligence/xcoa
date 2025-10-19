// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/cloudflare/

import { initSentry } from "./src/lib/sentry-cloudflare";

initSentry({
  dsn: "https://a5628f1997f0695e142e0a46d1a25bda@o4508391005356032.ingest.us.sentry.io/4510214264193024",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
});
