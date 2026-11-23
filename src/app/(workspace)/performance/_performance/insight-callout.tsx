"use client";

import { Sparkles } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * A presentational accent callout — "findings state, callouts suggest."
 * The findings panel carries measured observations; this carries the coach's
 * threshold-derived advice beside a chart. No data of its own.
 */
export function InsightCallout({
  title = "Coach's note",
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-accent/25 bg-accent-soft/60 px-4 py-3.5",
        className,
      )}
    >
      <p className="section-label mb-1.5 flex items-center gap-1.5 text-accent">
        <Sparkles size={12} aria-hidden />
        {title}
      </p>
      <div className="text-[0.8125rem] leading-relaxed text-ink">{children}</div>
    </div>
  );
}
