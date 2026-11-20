"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for dashboard.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function DashboardError({
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
      title="The dashboard didn't load"
      description="We couldn't render your dashboard. Try again — if it keeps failing, the database connection is the usual cause."
    />
  );
}
