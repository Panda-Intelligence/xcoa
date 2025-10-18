'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Global error boundary for handling errors in the root layout
 * This catches errors that error.tsx cannot handle
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error('Global error boundary caught:', error);

    // TODO: Send to error monitoring service (e.g., Sentry)
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Critical Error</h1>
            </div>

            <p className="text-muted-foreground mb-6">
              A critical error occurred. Please refresh the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-4 rounded-md mb-6">
                <p className="text-sm font-mono text-foreground mb-2">
                  <strong>Error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-muted-foreground">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-40 text-foreground">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={reset}
                className="flex-1 bg-primary hover:bg-primary text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-muted hover:bg-accent text-foreground font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
