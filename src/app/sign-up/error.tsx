"use client";

import { RouteError } from "@/components/shared/route-error";

export default function SignUpError({
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
      title="Sign-up didn't load"
      description="The create-account page hit a snag. Retry, or go back to the landing."
    />
  );
}
