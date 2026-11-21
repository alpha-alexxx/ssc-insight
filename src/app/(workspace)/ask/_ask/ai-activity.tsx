"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlaskConical,
  ListChecks,
  MessageSquare,
  ScanLine,
  Shield,
  Sparkles,
} from "lucide-react";
import { aiUsageQueryOptions } from "@/lib/queries/ai";
import { cn } from "@/lib/utils";

const FEATURE_META: Record<
  string,
  { label: string; icon: typeof MessageSquare }
> = {
  chat: { label: "Asked the coach", icon: MessageSquare },
  coach: { label: "Daily insight", icon: Sparkles },
  extract: { label: "Read a report", icon: ScanLine },
  todos: { label: "Planned tasks", icon: ListChecks },
  test: { label: "Connection test", icon: FlaskConical },
};

const STATUS_DOT: Record<string, string> = {
  success: "bg-positive",
  error: "bg-danger",
  aborted: "bg-warning",
  pending: "bg-muted",
};

function clockLabel(iso: string): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  return new Date(time).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * "The read ledger" — the usage ledger's newest rows in a timeline grammar:
 * a hairline connector, an icon tile per read, and the charged tokens. Rows
 * come from the server and carry no content by design; the conversation
 * itself lives on this device. The ledger records reads, never writes.
 */
export const AiActivity = memo(function AiActivity({
  refreshKey,
  className,
}: {
  /** Invalidates alongside quota events so the rail stays honest. */
  refreshKey?: unknown;
  className?: string;
}) {
  const query = useQuery(aiUsageQueryOptions);
  void refreshKey;
  const entries = query.data?.entries ?? [];

  return (
    <section className={cn("flex min-h-0 flex-col gap-2", className)}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <p className="section-label">The read ledger</p>
        {entries.length > 0 ? (
          <span className="tabular-nums rounded-pill border border-rule-soft px-1.5 py-px text-[0.625rem] text-muted">
            {entries.length}
          </span>
        ) : null}
      </div>
      {query.isPending ? (
        <p className="py-2 text-xs text-muted" aria-busy="true">
          Loading activity…
        </p>
      ) : entries.length === 0 ? (
        <p className="py-2 text-xs leading-relaxed text-muted">
          Nothing yet. Every question you ask logs a read here.
        </p>
      ) : (
        <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {entries.map((entry, index) => {
            const meta = FEATURE_META[entry.feature];
            const Icon = meta?.icon ?? MessageSquare;
            return (
              <li key={entry.id} className="relative flex gap-2.5 pb-3 last:pb-0">
                {index < entries.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-rule-soft"
                  />
                ) : null}
                <span
                  aria-hidden
                  className="relative z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-control border border-rule-soft bg-canvas text-muted"
                >
                  <Icon size={12} />
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 size-1.5 rounded-full",
                      STATUS_DOT[entry.status] ?? "bg-muted",
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-ink">
                    {meta?.label ?? entry.feature}
                  </span>
                  <span className="tabular-nums mt-0.5 block text-[0.625rem] text-muted">
                    {clockLabel(entry.createdAt)}
                    {entry.tokensCharged > 0
                      ? ` · ${entry.tokensCharged.toLocaleString("en-IN")} tok`
                      : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <p className="flex shrink-0 items-center gap-1.5 border-t border-rule-soft pt-2 text-[0.625rem] leading-relaxed text-muted">
        <Shield size={10} aria-hidden className="shrink-0 text-accent" />
        Read-only — the ledger records reads, never writes.
      </p>
    </section>
  );
});
