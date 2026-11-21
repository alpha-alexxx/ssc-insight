"use client";

import { RouteError } from "@/components/shared/route-error";

export default function SignInError({
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
      title="Sign-in didn't load"
      description="The sign-in page hit a snag. Retry, or go back to the landing."
    />
  );
}
