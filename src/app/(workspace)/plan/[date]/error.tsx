"use client";

import { useEffect } from "react";
import { Button } from "@/components/button";
import { describeError } from "@/components/shared/route-error";

/**
 * Route error boundary for plan/[date].
 *
 * Next passes `error` and `retry`; `retry()` re-fetches the segment, which is
 * what a failed server read needs. The presentation is composed locally from
 * tokens (the dashboard's error pattern) so this boundary never depends on
 * another route's chrome; the message/digest narrowing stays in the shared
 * helper.
 */
export default function PlanDayError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const { message, digest } = describeError(error);

  useEffect(() => {
    // Client-side render failures never reach the server otherwise.
    if (process.env.NODE_ENV !== "production") console.error("[route error]", error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto w-full max-w-lg px-5 py-16">
      <div className="rounded-2xl bg-card p-8 shadow-[inset_0_0_0_1px_var(--border)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-foreground">
          This plan day didn&apos;t load
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          We couldn&apos;t render the daily workspace. Try again to reload the
          plan and today&apos;s results.
        </p>
        {message ? (
          <p className="mt-4 rounded-[10px] bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
            {message}
            {digest ? (
              <span className="mt-1 block opacity-70">Reference: {digest}</span>
            ) : null}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button onClick={retry}>Try again</Button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
          >
            Go to dashboard
          </a>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Your saved mocks, plan progress and settings are untouched.
        </p>
      </div>
    </div>
  );
}
