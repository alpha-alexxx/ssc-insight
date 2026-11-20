"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for /ask.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment. The
 * conversation itself lives in client state and survives this boundary.
 */
export default function AskError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      title="Ask AI didn't load"
      description="We couldn't render the chat page. Try again — your conversations are safe on this device."
    />
  );
}
