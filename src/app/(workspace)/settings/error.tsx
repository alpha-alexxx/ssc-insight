"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Route error boundary for settings.
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs.
 */
export default function SettingsError({
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
      title="Settings didn't load"
      description="We couldn't render your settings. Try again — your saved preferences are untouched."
    />
  );
}
