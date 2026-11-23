"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for history.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function HistoryError({
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
      title="Your mock history didn't load"
      description="We couldn't render the saved results list. Try again to reload it."
    />
  );
}
