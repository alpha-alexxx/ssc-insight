"use client";

import { UsageMeter } from "@/components/usage-meter";
import { Icon } from "@/components/icon";
import type { AiStatus } from "@/lib/ai/client-types";
import { cn } from "@/lib/utils";

/**
 * The rail's quota footer on Hairline `usage-meter`: today's request count
 * against the active limit, plus the read-only pledge. Personal keys report
 * their own USER_KEY_SAFETY_LIMITS; the shared env key reports the
 * deployment's AI_DAILY_REQUEST_LIMIT — both arrive through /api/ai/status
 * usage.
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

  return (
    <div className={cn("border-t border-border px-3 py-2.5", className)}>
      {limit > 0 ? (
        <UsageMeter
          used={used}
          limit={limit}
          unit="reads"
          label="Today's reads"
          resetAt={resetAt}
        />
      ) : null}
      <p className="mt-2 flex items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Icon name="shield" size={10} tone="primary" className="shrink-0" />
        Read-only — the coach answers from your tracker and writes nothing.
      </p>
    </div>
  );
}
