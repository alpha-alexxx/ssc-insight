"use client";

import { Shield } from "@/components/ui/icons";
import type { AiStatus } from "@/lib/ai/client-types";
import { cn } from "@/lib/utils";

/**
 * The rail's quota footer: today's request count against the active limit as
 * a hairline meter, plus the read-only pledge. Personal keys report their own
 * USER_KEY_SAFETY_LIMITS; the shared env key reports the deployment's
 * AI_DAILY_REQUEST_LIMIT — both arrive through /api/ai/status usage.
 */
export function UsageFooter({
  status,
  className,
}: {
  status: AiStatus | null;
  className?: string;
}) {
  const usage = status?.usage;
  const limit = usage?.limits.requests ?? 0;
  const used = usage?.requests ?? 0;
  const share = limit > 0 ? Math.min(used / limit, 1) : 0;
  const over = limit > 0 && used >= limit;

  return (
    <div className={cn("border-t border-rule-soft px-3 py-2.5", className)}>
      {limit > 0 ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="section-label">Today&apos;s reads</span>
            <span
              className={cn(
                "tabular-nums text-[0.6875rem]",
                over ? "text-danger" : "text-muted",
              )}
            >
              {used} / {limit}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="AI requests used today"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={limit}
            className="mt-1.5 h-0.5 w-full overflow-hidden rounded-pill bg-rule-soft"
          >
            <div
              className={cn(
                "h-full rounded-pill transition-[width] duration-500",
                over ? "bg-danger" : "bg-accent",
              )}
              style={{ width: `${Math.max(share * 100, used > 0 ? 4 : 0)}%` }}
            />
          </div>
        </>
      ) : null}
      <p className="mt-2 flex items-center gap-1.5 text-[0.625rem] leading-relaxed text-muted">
        <Shield size={10} aria-hidden className="shrink-0 text-accent" />
        Read-only — the coach answers from your tracker and writes nothing.
      </p>
    </div>
  );
}
