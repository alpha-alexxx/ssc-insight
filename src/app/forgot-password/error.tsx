"use client";

import { RouteError } from "@/components/shared/route-error";

export default function ForgotPasswordError({
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
      title="Reset didn't load"
      description="The password-reset page hit a snag. Retry, or go back to the landing."
    />
  );
}
