"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon, type IconName } from "@/components/icon";
import { aiUsageQueryOptions } from "@/lib/queries/ai";
import { cn } from "@/lib/utils";

const FEATURE_META: Record<
  string,
  { label: string; icon: IconName }
> = {
  chat: { label: "Asked the coach", icon: "chat" },
  coach: { label: "Daily insight", icon: "sparkles" },
  extract: { label: "Read a report", icon: "report" },
  todos: { label: "Planned tasks", icon: "list" },
  test: { label: "Connection test", icon: "activity" },
};

const STATUS_DOT: Record<string, string> = {
  success: "bg-success",
  error: "bg-destructive",
  aborted: "bg-warning",
  pending: "bg-muted-foreground/40",
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
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          The read ledger
        </p>
        {entries.length > 0 ? (
          <span className="tabular-nums rounded-full border border-border px-1.5 py-px text-[10px] text-muted-foreground">
            {entries.length}
          </span>
        ) : null}
      </div>
      {query.isPending ? (
        <p className="py-2 text-xs text-muted-foreground" aria-busy="true">
          Loading activity…
        </p>
      ) : entries.length === 0 ? (
        <p className="py-2 text-xs leading-relaxed text-muted-foreground">
          Nothing yet. Every question you ask logs a read here.
        </p>
      ) : (
        <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {entries.map((entry, index) => {
            const meta = FEATURE_META[entry.feature];
            const icon = meta?.icon ?? "chat";
            return (
              <li key={entry.id} className="relative flex gap-2.5 pb-3 last:pb-0">
                {index < entries.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border"
                  />
                ) : null}
                <span
                  aria-hidden
                  className="relative z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground"
                >
                  <Icon name={icon} size={12} />
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 size-1.5 rounded-full",
                      STATUS_DOT[entry.status] ?? "bg-muted-foreground/40",
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {meta?.label ?? entry.feature}
                  </span>
                  <span className="tabular-nums mt-0.5 block text-[10px] text-muted-foreground">
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
      <p className="flex shrink-0 items-center gap-1.5 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
        <Icon name="shield" size={10} tone="primary" className="shrink-0" />
        Read-only — the ledger records reads, never writes.
      </p>
    </section>
  );
});
