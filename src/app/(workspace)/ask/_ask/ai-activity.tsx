"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { aiUsageQueryOptions } from "@/lib/queries/ai";
import { cn } from "@/lib/utils";

const FEATURE_LABELS: Record<string, string> = {
  chat: "Asked the coach",
  coach: "Daily insight",
  extract: "Read a report",
  todos: "Planned tasks",
  test: "Connection test",
};

const STATUS_DOT: Record<string, string> = {
  success: "bg-positive",
  error: "bg-danger",
  aborted: "bg-warning",
  pending: "bg-muted",
};

function relative(iso: string): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * "What did the AI do" — the usage ledger's newest rows. Every AI action the
 * account has made: insights, questions, report reads, task plans. Rows carry
 * no content by design; the conversation itself lives on this device.
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
    <section className={cn("min-h-0 flex flex-col gap-1.5", className)}>
      <p className="section-label shrink-0">Recent AI activity</p>
      {query.isPending ? (
        <p className="py-2 text-xs text-muted" aria-busy="true">
          Loading activity…
        </p>
      ) : entries.length === 0 ? (
        <p className="py-2 text-xs leading-relaxed text-muted">
          Nothing yet. Questions, insights, and report reads appear here.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-baseline gap-2 border-b border-rule-soft py-1.5 last:border-b-0"
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1 inline-block size-1.5 shrink-0 rounded-full",
                  STATUS_DOT[entry.status] ?? "bg-muted",
                )}
              />
              <span className="min-w-0 flex-1 truncate text-xs text-ink">
                {FEATURE_LABELS[entry.feature] ?? entry.feature}
              </span>
              <span className="shrink-0 text-[10px] text-muted">
                {relative(entry.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
