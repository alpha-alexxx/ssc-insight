"use client";

import { memo, type CSSProperties } from "react";
import { PlainIcon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";
import {
  accuracyTone,
  scoreBarTone,
  typeChip,
} from "@/components/attempt-display";
import {
  SUBJECTS,
  subjectStats,
  totals,
  formatNumber as n,
  formatTime,
  type Attempt,
  type SubjectId,
} from "@/lib/domain";
import { tierLabelFor } from "@/lib/exams";
import { istTimeLabel, mockTypeLabel, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * AttemptCard — the one card for a saved mock result, used by `/history`
 * (browse) and `/compare` (select).
 *
 * Anatomy, top to bottom, identical in both modes so the two pages read as one
 * product:
 *
 *   1. identity   type tile · name · platform / date / time · score ring
 *   2. score      marks over paper maximum, with a meter
 *   3. subjects   one row per subject in the paper, in its fixed chart hue
 *   4. vitals     accuracy · percentile · time, as a ruled strip
 *   5. footer     type + tier chips, and the actions
 *
 * Every figure comes from `totals()` / `subjectStats()`, the scoring source of
 * truth; nothing is re-derived here. A value that was not recorded renders as
 * an em dash, never as zero.
 *
 * `mode="select"` turns the whole card into a single toggle (a real button
 * stretched under the content, so the actions inside stay independently
 * clickable). It is what the compare picker uses.
 */

const SUBJECT_HUE: Record<string, string> = {
  quant: "var(--chart-1)",
  reasoning: "var(--chart-2)",
  english: "var(--chart-3)",
  ga: "var(--chart-4)",
  computer: "var(--chart-5)",
};

const ringTone = (pct: number) =>
  pct >= 70
    ? "var(--success)"
    : pct >= 50
      ? "var(--primary)"
      : "var(--warning)";

/** A compact score ring: the share of the paper, the number printed inside. */
function ScoreRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size } as CSSProperties}
      role="img"
      aria-label={`${n(clamped, 0)} percent of the paper`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringTone(clamped)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-[11.5px] font-semibold tabular-nums leading-none text-foreground">
        {n(clamped, 0)}
        <span className="text-[8px] font-medium text-muted-foreground">%</span>
      </span>
    </span>
  );
}

function Vital({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2 first:pl-3">
      <dt className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "truncate text-[13px] font-semibold tabular-nums text-foreground",
          tone,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export interface AttemptCardProps {
  attempt: Attempt;
  /** `browse` shows actions; `select` makes the whole card a toggle. */
  mode?: "browse" | "select";
  selected?: boolean;
  /** Select mode only: the selection is full and this card is not in it. */
  disabled?: boolean;
  onSelectedChange?: (attempt: Attempt) => void;
  onOpen?: (attempt: Attempt) => void;
  onCompare?: (attempt: Attempt) => void;
  className?: string;
}

export const AttemptCard = memo(function AttemptCard({
  attempt,
  mode = "browse",
  selected = false,
  disabled = false,
  onSelectedChange,
  onOpen,
  onCompare,
  className,
}: AttemptCardProps) {
  const t = totals(attempt);
  const pct = t.maxScore ? (t.score / t.maxScore) * 100 : 0;
  const tier = tierLabelFor(attempt.examId, attempt.tierId);
  const selectable = mode === "select";

  const subjects = attempt.subjects.map((subject) => {
    const stats = subjectStats(subject, attempt.marking);
    const meta = SUBJECTS[subject.subjectId as SubjectId];
    return {
      id: subject.subjectId,
      label: meta?.short ?? subject.subjectId,
      pct: Math.max(0, Math.min(100, stats.percentage)),
      qualifying: subject.qualifying,
    };
  });

  return (
    <article
      data-selected={selected || undefined}
      aria-label={attempt.name}
      className={cn(
        "group/card relative flex min-w-0 flex-col rounded-2xl bg-card text-card-foreground",
        "shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,background-color,opacity] duration-200",
        "motion-reduce:transition-none",
        !selectable &&
          "hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_22%,var(--border))]",
        selectable &&
          !disabled &&
          !selected &&
          "hover:bg-accent/30 hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_40%,var(--border))]",
        selected && "bg-primary/4 shadow-[inset_0_0_0_2px_var(--primary)]",
        selectable && disabled && !selected && "opacity-55",
        className,
      )}
    >
      {selectable && (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`${selected ? "Remove" : "Select"} ${attempt.name} ${selected ? "from" : "for"} comparison`}
          disabled={disabled && !selected}
          onClick={() => onSelectedChange?.(attempt)}
          className="absolute inset-0 z-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
        />
      )}

      {/* 1 · identity */}
      <header className="pointer-events-none relative z-1 flex items-start gap-3 p-4 pb-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            typeChip(attempt.type),
          )}
        >
          <PlainIcon name="file" size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.005em] text-foreground">
            {attempt.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] leading-snug text-muted-foreground">
            <span className="truncate font-medium text-foreground/80">
              {attempt.platform}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={attempt.completedAt} className="tabular-nums">
              {shortDate(attempt.completedAt)}
            </time>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span className="hidden tabular-nums sm:inline">
              {istTimeLabel(attempt.completedAt)}
            </span>
          </p>
        </div>
        {selectable ? (
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full transition-colors",
              selected
                ? "bg-primary text-primary-foreground"
                : "text-transparent shadow-[inset_0_0_0_1.5px_var(--input)] group-hover/card:shadow-[inset_0_0_0_1.5px_var(--primary)]",
            )}
          >
            <PlainIcon name="check" size={13} tone="current" />
          </span>
        ) : (
          <ScoreRing pct={pct} />
        )}
      </header>

      {/* 2 · score */}
      <div className="pointer-events-none relative z-1 px-4">
        <div className="flex items-end justify-between gap-3">
          <p className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-foreground">
              {n(t.score, 2)}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              / {n(t.maxScore, 0)}
            </span>
          </p>
          {selectable ? (
            <span className="text-[12px] font-semibold tabular-nums text-foreground">
              {n(pct, 1)}%
            </span>
          ) : (
            <span className="text-[11.5px] tabular-nums text-muted-foreground">
              {n(pct, 1)}% of paper
            </span>
          )}
        </div>
        <div
          className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Score as a share of the paper"
        >
          <div
            className={cn("h-full rounded-full", scoreBarTone(pct))}
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
      </div>

      {/* 3 · subjects */}
      {subjects.length > 0 && (
        <ul
          aria-label="Score by subject"
          className="pointer-events-none relative z-1 mt-4 grid grid-cols-1 gap-x-5 gap-y-2 px-4 min-[420px]:grid-cols-2 sm:grid-cols-1 min-[560px]:grid-cols-2"
        >
          {subjects.map((subject, i) => (
            <li
              key={subject.id}
              className={cn(
                "flex min-w-0 items-center gap-2",
                subjects.length % 2 === 1 &&
                  i === subjects.length - 1 &&
                  "min-[420px]:col-span-2 sm:col-span-1 min-[560px]:col-span-2",
              )}
            >
              <span
                className="w-18 shrink-0 truncate text-[11px] text-muted-foreground"
                title={subject.label}
              >
                {subject.label}
                {subject.qualifying ? "*" : ""}
              </span>
              <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${subject.pct}%`,
                    background: SUBJECT_HUE[subject.id] ?? "var(--chart-1)",
                  }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[11px] font-medium tabular-nums text-foreground">
                {n(subject.pct, 0)}%
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 4 · vitals */}
      <dl className="pointer-events-none relative z-1 mx-4 mb-4 mt-4 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl bg-muted/50 shadow-[inset_0_0_0_1px_var(--border)]">
        <Vital
          label="Accuracy"
          value={t.accuracy == null ? "—" : `${n(t.accuracy)}%`}
          tone={
            accuracyTone(t.accuracy).includes("text-success")
              ? "text-success"
              : undefined
          }
        />
        <Vital
          label="Percentile"
          value={attempt.percentile == null ? "—" : n(attempt.percentile)}
        />
        <Vital label="Time" value={formatTime(t.timeSeconds)} />
      </dl>

      {/* 5 · footer */}
      <footer className="relative z-1 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
        <div className="pointer-events-none flex min-w-0 flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
              typeChip(attempt.type),
            )}
          >
            {mockTypeLabel(attempt.type)}
          </span>
          {tier && tier !== "Main" && (
            <span className="truncate rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
              {tier}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onCompare && !selectable && (
            <button
              type="button"
              onClick={() => onCompare(attempt)}
              aria-label={`Compare ${attempt.name}`}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <PlainIcon name="compare" size={13} />
              Compare
            </button>
          )}
          {onOpen && (
            <button
              type="button"
              onClick={() => onOpen(attempt)}
              aria-label={`Open ${attempt.name}`}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                selectable
                  ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                  : "bg-foreground/6 text-foreground hover:bg-foreground/10",
              )}
            >
              Details
              <PlainIcon name="arrowRight" size={13} />
            </button>
          )}
          {selectable && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-flex h-8 items-center rounded-full px-2.5 text-[11.5px] font-medium",
                selected ? "text-primary" : "text-muted-foreground",
              )}
            >
              {selected
                ? "Selected"
                : disabled
                  ? "Limit reached"
                  : "Tap to select"}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
});

/** Loading placeholder with the same silhouette as the card. */
export function AttemptCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <Skeleton shape="block" width={40} height={40} />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton width="70%" height={13} />
          <Skeleton width="45%" height={10} />
        </div>
        <Skeleton shape="circle" width={48} />
      </div>
      <Skeleton width="38%" height={26} />
      <Skeleton width="100%" height={6} />
      <div className="space-y-2">
        <Skeleton width="100%" height={6} />
        <Skeleton width="100%" height={6} />
        <Skeleton width="100%" height={6} />
      </div>
      <Skeleton shape="block" height={46} />
    </div>
  );
}
