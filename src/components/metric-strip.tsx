"use client";
import type { HTMLAttributes } from "react";
import Link from "next/link";
import { NumberRoll } from "./number-roll";
import { PlainIcon, type IconName } from "./icon";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * One cell of a metric band — the Hairline stats-band grammar (label, one
 * figure, one quiet hint line, a 2px progress rule) with the links and
 * references this app's strips carry: a cell is a link, a button, or plain
 * content depending on whether it has a destination — static cells suppress
 * the chevron and the hover fill.
 *
 * The figure rolls (NumberRoll) when `roll` supplies a number; the `value`
 * string always stays the accessible text and the fallback. Shared by the
 * dashboard overview, the history KPIs, the calendar strip and the tasks
 * overview so all four strips are literally the same component.
 */

export interface MetricRoll {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Intl.NumberFormat options, e.g. { maximumFractionDigits: 1 }. */
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
}

const DELTA_TONE: Record<string, string> = {
  "is-up": "text-success",
  "is-down": "text-destructive",
  "is-flat": "text-muted-foreground",
};

export function MetricCell({
  label,
  icon,
  value,
  hint,
  pct,
  tone,
  delta,
  onClick,
  href,
  roll,
}: {
  label: string;
  icon: IconName;
  value: string;
  hint: string;
  /** 0–1 progress for the rule; null renders a decorative empty rule. */
  pct: number | null;
  /** Semantic tone for the figure itself (danger when work is overdue). */
  tone?: "danger";
  delta?: { tone: string; label: string } | null;
  onClick?: () => void;
  href?: string;
  /** Renders the figure as a rolling number instead of the literal text. */
  roll?: MetricRoll | null;
}) {
  const interactive = !!(href || onClick);
  const figure = roll ? (
    <NumberRoll
      value={roll.value}
      format={roll.format}
      locales={roll.locales}
      prefix={roll.prefix}
      suffix={roll.suffix}
    />
  ) : (
    value
  );
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-1.5">
        <PlainIcon name={icon} size={14} tone="primary" className="shrink-0" />
        <span className="truncate text-[12px] text-muted-foreground">
          {label}
        </span>
        {interactive && (
          <PlainIcon
            name="chevronRight"
            size={12}
            tone="muted"
            className="ml-auto shrink-0"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            "font-serif text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground",
            tone === "danger" && "text-destructive",
          )}
        >
          {figure}
        </span>
        {delta && (
          <span
            className={cn(
              "text-[12px] font-medium tabular-nums",
              DELTA_TONE[delta.tone] ?? "text-muted-foreground",
            )}
          >
            {delta.label}
          </span>
        )}
      </span>
      <span className="truncate text-[12px] leading-relaxed text-muted-foreground">
        {hint}
      </span>
      <span
        className="mt-1 block h-0.5 w-full bg-muted"
        role={pct != null ? "progressbar" : undefined}
        aria-label={pct != null ? `${label} progress` : undefined}
        aria-valuemin={pct != null ? 0 : undefined}
        aria-valuemax={pct != null ? 100 : undefined}
        aria-valuenow={pct != null ? Math.round(pct * 100) : undefined}
        aria-hidden={pct == null ? true : undefined}
      >
        <span
          className={cn(
            "block h-full transition-[width] duration-300",
            pct != null ? "bg-primary" : "bg-transparent",
          )}
          style={{ width: `${Math.round((pct ?? 0) * 100)}%` }}
        />
      </span>
    </>
  );
  const className = cn(
    "flex min-w-0 flex-col gap-1.5 bg-card px-4 py-4 text-left",
    interactive
      ? "cursor-pointer transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-5 sm:py-5"
      : "cursor-default",
  );
  if (href) {
    return (
      <Link
        href={href}
        className={className}
        aria-label={`${label}: ${value}. ${hint}`}
      >
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label={`${label}: ${value}. ${hint}`}
      >
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}

/**
 * The divided strip several metric cells sit in: a card with a 1px hairline
 * grid inside, two cells wide on phones, four from md. The gap-px trick draws
 * every interior divider at any column count without per-cell border math.
 */
export function MetricBand({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-[inset_0_0_0_1px_var(--border)] md:grid-cols-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Loading placeholder matching the real strip's cell rhythm. */
export function MetricStripSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <MetricBand>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 bg-card px-4 py-4 sm:px-5 sm:py-5"
          >
            <Skeleton width={80} height={12} />
            <Skeleton width={80} height={28} />
            <Skeleton width={96} height={12} />
            <Skeleton height={2} className="mt-1" />
          </div>
        ))}
      </MetricBand>
    </div>
  );
}
