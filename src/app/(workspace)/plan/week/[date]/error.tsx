"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for plan/week/[date].
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function PlanWeekError({
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
      title="This plan week didn't load"
      description="We couldn't render the seven-day schedule. Try again to reload the plan."
    />
  );
}
