"use client";

import type { ReactNode } from "react";
import { PlainIcon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * Hairline panel composition for the /performance views.
 *
 * Card, separator and heading are composed from the token set (MIGRATION.md
 * rule 1: no Card/Label components exist to import); every panel on this
 * page renders the same chrome so the evidence reads as one document.
 */
export function Panel({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
            >
              <PlainIcon name={icon} size={16} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className={cn("px-4 pb-4 sm:px-5 sm:pb-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chart colour identity                                               */
/* ------------------------------------------------------------------ */

/**
 * Subject chart hues are the global identity set, never re-themed per
 * palette: quant=--chart-1, reasoning=--chart-2, english=--chart-3,
 * ga=--chart-4, computer=--chart-5 (globals.css header contract).
 */
const SUBJECT_CHART: Record<string, string> = {
  quant: "var(--chart-1)",
  reasoning: "var(--chart-2)",
  english: "var(--chart-3)",
  ga: "var(--chart-4)",
  computer: "var(--chart-5)",
};

/** Any CSS colour string (SVG stroke/fill attributes). */
export const subjectColor = (id: string): string =>
  SUBJECT_CHART[id] ?? "var(--chart-1)";

/** Tailwind utility form, for components that colour themselves by class. */
export const subjectColorClass = (id: string): string =>
  `text-chart-${subjectChartIndex(id)}`;

const SUBJECT_INDEX: Record<string, number> = {
  quant: 1,
  reasoning: 2,
  english: 3,
  ga: 4,
  computer: 5,
};

export function subjectChartIndex(id: string): 1 | 2 | 3 | 4 | 5 {
  return (SUBJECT_INDEX[id] ?? 1) as 1 | 2 | 3 | 4 | 5;
}
