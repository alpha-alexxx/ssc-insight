"use client";

import { PlainIcon } from "@/components/icon";
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
        "rounded-xl bg-accent px-4 py-3.5 text-accent-foreground",
        "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
        className,
      )}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
        <PlainIcon name="sparkles" size={12} />
        {title}
      </p>
      <div className="text-[13px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}
