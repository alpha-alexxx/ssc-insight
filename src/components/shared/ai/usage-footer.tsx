"use client";

import { UsageMeter } from "@/components/usage-meter";
import { Icon } from "@/components/icon";
import type { AiStatus } from "@/lib/ai/client-types";
import { cn } from "@/lib/utils";

/**
 * The rail's quota footer on Hairline `usage-meter`: today's request count
 * against the active limit, plus the read-only pledge. The shared env key
 * reports the deployment's AI_DAILY_REQUEST_LIMIT through /api/ai/status
 * usage; a personal key has no cap, so it shows the count alone.
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
  const resetAt = usage?.resetAt ? new Date(usage.resetAt) : undefined;
  const capped = Number.isFinite(limit) && limit > 0;

  return (
    <div className={cn("border-t border-border px-3 py-2.5", className)}>
      {capped ? (
        <UsageMeter
          used={used}
          limit={limit}
          unit="reads"
          label="Today's reads"
          resetAt={resetAt}
        />
      ) : (
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {used} {used === 1 ? "read" : "reads"} today · unlimited with your
          own key
        </p>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Icon name="shield" size={10} tone="primary" className="shrink-0" />
        Read-only — the coach answers from your tracker and writes nothing.
      </p>
    </div>
  );
}
