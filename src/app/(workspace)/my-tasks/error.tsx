"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for my-tasks.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function MyTasksError({
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
      title="Your tasks didn't load"
      description="We couldn't render your task board. Try again to reload your personal tasks and the plan rail."
    />
  );
}
