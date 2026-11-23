"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/button";

/**
 * Shared presentation for every route-level `error.tsx`.
 *
 * This Next version (16.4.6) passes `{ error, retry }` to an error boundary.
 * `retry()` re-fetches and re-renders the segment; `reset()` only re-renders
 * without re-fetching, which loops forever when the failure came from server
 * data. The plan therefore threads `retry`, never `reset`.
 *
 * Message safety: an error thrown in a Server Component arrives with a generic
 * message and a `digest` that matches the server log; a client-thrown value may
 * be anything at all. Both are narrowed here, and the digest is shown so a
 * report can be matched to a log line without ever printing a stack trace.
 */
export function RouteError({
  error,
  retry,
  title,
  description,
}: {
  error: unknown;
  retry: () => void;
  title: string;
  description: string;
}) {
  const { message, digest } = describeError(error);

  useEffect(() => {
    // Client-side render failures never reach the server otherwise.
    if (process.env.NODE_ENV !== "production") console.error("[route error]", error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto w-full max-w-lg px-5 py-16">
      <div className="rounded-2xl bg-card p-8 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
        {message ? (
          <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
            {message}
            {digest ? (
              <span className="mt-1 block opacity-70">Reference: {digest}</span>
            ) : null}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg" onClick={retry}>
            Try again
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go to dashboard
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Your saved mocks, plan progress and settings are untouched.
        </p>
      </div>
    </div>
  );
}

/** Narrow an unknown thrown value into a displayable message + digest. */
export function describeError(error: unknown): {
  message: string | null;
  digest: string | null;
} {
  if (error instanceof Error) {
    const digest =
      "digest" in error && typeof error.digest === "string" ? error.digest : null;
    return { message: error.message.trim() || null, digest };
  }
  if (typeof error === "string") return { message: error.trim() || null, digest: null };
  return { message: null, digest: null };
}
