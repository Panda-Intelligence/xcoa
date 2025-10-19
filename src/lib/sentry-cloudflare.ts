type SentryInitOptions = {
  dsn: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  sendDefaultPii?: boolean;
  enableLogs?: boolean;
};

type ParsedDsn = {
  protocol: string;
  host: string;
  projectId: string;
  publicKey: string;
  path: string;
};

type CaptureContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  };
  user?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'critical';
};

type FlushablePromise = Promise<unknown> & { __sentryTracked?: true };

type NextErrorContext = {
  err?: unknown;
  pathname?: string;
  path?: string;
  asPath?: string;
  query?: Record<string, unknown>;
  req?: {
    url?: string;
    method?: string;
    headers?: Record<string, string | string[]>;
  };
};

type OnRequestErrorContext = {
  routeType?: string;
  routePath?: string;
  routerKind?: string;
};

const SENTRY_SDK_NAME = 'openecoa.cloudflare';
const SENTRY_SDK_VERSION = '0.1.0';

let sentryConfig: (SentryInitOptions & ParsedDsn) | null = null;
let latestInitHash: string | null = null;
const pendingEnvelopes = new Set<FlushablePromise>();

function logDebug(...args: unknown[]) {
  if (sentryConfig?.enableLogs) {
    console.log('[sentry]', ...args);
  }
}

function logError(...args: unknown[]) {
  if (sentryConfig?.enableLogs) {
    console.error('[sentry]', ...args);
  }
}

function hashInitOptions(options: SentryInitOptions) {
  return JSON.stringify({
    dsn: options.dsn,
    environment: options.environment,
    release: options.release,
    tracesSampleRate: options.tracesSampleRate,
    sendDefaultPii: options.sendDefaultPii,
  });
}

function parseDsn(dsn: string): ParsedDsn {
  const url = new URL(dsn);
  const protocol = url.protocol.replace(':', '');
  const publicKey = url.username;
  const host = url.host;
  const segments = url.pathname.replace(/^\//, '').split('/').filter(Boolean);

  if (!publicKey) {
    throw new Error('Invalid Sentry DSN: missing public key');
  }

  const projectId = segments.pop() ?? '';

  if (!projectId) {
    throw new Error('Invalid Sentry DSN: missing project id');
  }

  const path = segments.length ? `/${segments.join('/')}` : '';

  return {
    protocol,
    host,
    projectId,
    publicKey,
    path,
  };
}

function coerceToError(input: unknown): Error {
  if (input instanceof Error) {
    return input;
  }

  if (typeof input === 'string') {
    return new Error(input);
  }

  try {
    return new Error(JSON.stringify(input));
  } catch {
    return new Error(String(input));
  }
}

function buildStacktrace(stack: string | undefined) {
  if (!stack) {
    return undefined;
  }

  const lines = stack.split('\n').slice(1);
  const frames = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const chromeMatch = line.match(/^at (?:(.*?) )?\(?(.+?):(\d+):(\d+)\)?$/);
    if (chromeMatch) {
      const [, fn, file, lineNo, columnNo] = chromeMatch;
      frames.push({
        function: fn?.replace(/^Object\./, '') ?? '<anonymous>',
        filename: file,
        lineno: Number.parseInt(lineNo, 10),
        colno: Number.parseInt(columnNo, 10),
      });
      continue;
    }

    const firefoxMatch = line.match(/^(.*)@(.+?):(\d+):(\d+)$/);
    if (firefoxMatch) {
      const [, fn, file, lineNo, columnNo] = firefoxMatch;
      frames.push({
        function: fn || '<anonymous>',
        filename: file,
        lineno: Number.parseInt(lineNo, 10),
        colno: Number.parseInt(columnNo, 10),
      });
      continue;
    }
  }

  if (!frames.length) {
    return undefined;
  }

  return { frames: frames.reverse() };
}

function headersToRecord(headers: Headers | Record<string, unknown> | undefined | null) {
  if (!headers) return undefined;

  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key.toLowerCase()] = value;
    });
    return record;
  }

  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      record[key.toLowerCase()] = value;
    } else if (Array.isArray(value) && value.length) {
      record[key.toLowerCase()] = value.join(', ');
    }
  }

  return Object.keys(record).length ? record : undefined;
}

function requestToContext(request: Request | undefined) {
  if (!request) return undefined;

  return {
    method: request.method,
    url: request.url,
    headers: headersToRecord(request.headers),
  };
}

function createEventId() {
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)).replace(/-/g, '');
}

function buildEnvelopeUrl(parsed: ParsedDsn) {
  const basePath = parsed.path ? `${parsed.path}/` : '/';
  return `${parsed.protocol}://${parsed.host}${basePath}api/${parsed.projectId}/envelope/?sentry_key=${parsed.publicKey}&sentry_version=7`;
}

function trackPromise(promise: Promise<unknown>) {
  const tracked = promise as FlushablePromise;
  tracked.__sentryTracked = true;
  pendingEnvelopes.add(tracked);

  tracked.finally(() => {
    pendingEnvelopes.delete(tracked);
  }).catch(() => {
    // Already logged through sendEnvelope.
  });

  return tracked;
}

async function sendEnvelope(body: string) {
  if (!sentryConfig) return;

  try {
    await fetch(buildEnvelopeUrl(sentryConfig), {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/x-sentry-envelope',
      },
    });
  } catch (error) {
    logError('Failed to send Sentry envelope', error);
    throw error;
  }
}

export function initSentry(options: SentryInitOptions) {
  if (!options?.dsn) {
    logDebug('Sentry disabled: missing DSN');
    sentryConfig = null;
    latestInitHash = null;
    return;
  }

  const configHash = hashInitOptions(options);
  if (configHash === latestInitHash) {
    return;
  }

  latestInitHash = configHash;
  sentryConfig = {
    ...options,
    ...parseDsn(options.dsn),
  };

  logDebug('Sentry initialized for Cloudflare runtime');
}

export function captureException(error: unknown, context: CaptureContext = {}) {
  if (!sentryConfig) {
    return undefined;
  }

  const normalized = coerceToError(error);
  const eventId = createEventId();
  const timestamp = Date.now() / 1000;

  const event: Record<string, unknown> = {
    event_id: eventId,
    timestamp,
    level: context.level ?? 'error',
    platform: 'javascript',
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    exception: {
      values: [
        {
          type: normalized.name || 'Error',
          value: normalized.message,
          stacktrace: buildStacktrace(normalized.stack),
        },
      ],
    },
    tags: context.tags,
    extra: context.extra,
    request: context.request,
    contexts: {
      runtime: {
        name: 'workerd',
      },
      ...context.contexts,
    },
  };

  if (context.user && sentryConfig.sendDefaultPii) {
    event.user = context.user;
  }

  const envelopeHeader = {
    event_id: eventId,
    sent_at: new Date().toISOString(),
    sdk: {
      name: SENTRY_SDK_NAME,
      version: SENTRY_SDK_VERSION,
    },
    dsn: sentryConfig.dsn,
  };

  const itemHeader = {
    type: 'event',
    sample_rates: [],
  };

  const envelope = `${JSON.stringify(envelopeHeader)}\n${JSON.stringify(itemHeader)}\n${JSON.stringify(event)}`;

  const promise = sendEnvelope(envelope);
  trackPromise(promise);

  return eventId;
}

export function captureRequestError(
  error: unknown,
  request: Request & { nextUrl?: URL } | undefined,
  errorContext: OnRequestErrorContext = {},
) {
  const requestData = requestToContext(request);
  const extra: Record<string, unknown> = {
    routeType: errorContext.routeType,
    routePath: errorContext.routePath,
    routerKind: errorContext.routerKind,
  };

  if (request?.nextUrl) {
    extra.nextUrl = request.nextUrl.href;
  }

  captureException(error, {
    request: requestData,
    extra,
    tags: {
      'router.kind': errorContext.routerKind ?? 'unknown',
      'router.route': errorContext.routePath ?? 'unknown',
      'router.type': errorContext.routeType ?? 'unknown',
    },
    level: 'error',
  });
}

export async function captureUnderscoreErrorException(context: NextErrorContext) {
  if (!context) {
    return;
  }

  const error = context.err ?? new Error('_error.tsx invoked without an error instance');

  captureException(error, {
    extra: {
      pathname: context.pathname ?? context.path,
      asPath: context.asPath,
      query: context.query,
      request: context.req,
    },
    tags: {
      source: '_error',
    },
  });

  await flush();
}

export async function flush(timeout: number = 2000) {
  if (pendingEnvelopes.size === 0) {
    return true;
  }

  const settledPromise = Promise.allSettled(Array.from(pendingEnvelopes));

  if (timeout <= 0) {
    await settledPromise;
    return true;
  }

  const timeoutPromise = new Promise<boolean>(resolve => {
    setTimeout(() => resolve(false), timeout);
  });

  const result = await Promise.race([settledPromise.then(() => true), timeoutPromise]);
  return result;
}
