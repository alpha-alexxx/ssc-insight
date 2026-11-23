"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for add.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function AddError({
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
      title="The mock form didn't load"
      description="We couldn't render the entry form. Try again — nothing has been saved yet."
    />
  );
}
