"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for compare.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function CompareError({
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
      title="The comparison didn't load"
      description="We couldn't render the comparison. Try again to reload the selected results."
    />
  );
}
