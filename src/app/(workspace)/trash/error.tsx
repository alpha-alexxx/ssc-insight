"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for trash.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function TrashError({
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
      title="Trash didn't load"
      description="We couldn't render the recoverable records. Try again — nothing has been permanently deleted."
    />
  );
}
