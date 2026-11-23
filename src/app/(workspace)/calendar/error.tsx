"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for calendar.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function CalendarError({
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
      title="The calendar didn't load"
      description="We couldn't render your study calendar. Try again to reload the plan, your tasks and your logged mocks."
    />
  );
}
