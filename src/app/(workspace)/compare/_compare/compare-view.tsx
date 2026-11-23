"use client";
import { memo, useMemo, useState } from "react";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Badge, type BadgeTone } from "@/components/badge";
import { Skeleton } from "@/components/skeleton";
import { Alert } from "@/components/alert";
import { Checkbox } from "@/components/checkbox";
import { CompareBars, type CompareBarsDatum } from "@/components/compare-bars";
import {
  ThresholdLine,
  type ThresholdLineDatum,
} from "@/components/threshold-line";
import { AttemptPagination } from "@/components/attempt-pagination";
import {
  SUBJECTS,
  sectionIds,
  subjectIds,
  subjectStats,
  totals,
  formatNumber as n,
  formatTime,
  type Attempt,
  type PagedAttempts,
  type PageSize,
  type SectionId,
} from "@/lib/domain";
import { sectionsForAttempt } from "@/lib/exams";
import type { PatternSection } from "@/lib/domain";
import { istTimeLabel, mockTypeLabel, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Compare — a picker, a selection bar, and an insight stack.
 *
 * The ledger answers three questions the old version never asked:
 *   · Where did this result land against the target for its own paper?
 *   · How did it move from the previous attempt?
 *   · How does it sit against the filtered average?
 *
 * Deltas are measured on percentages, because the selected mocks may have
 * different maxima; raw marks are only compared when the maxima match, and
 * the table says so when they do not.
 *
 * The insight stack's figures stay in the tables; Hairline's CompareBars
 * pairs the first and last selected mocks subject-by-subject (the same
 * pair the Change column reads), and ThresholdLine reads the selected
 * mocks against your filtered average — drag the line to see how many
 * sit above any score you care to test.
 */

const dateLabel = shortDate;
const typeName = mockTypeLabel;

export type CompareReference = {
  /** Target for a tier, keyed "examId:tierId". */
  targetFor: (attempt: Attempt) => { marks: number; maxScore: number } | null;
  /** Average percentage across the current filtered set, when available. */
  averagePercentage: number | null;
  averageCount: number | null;
};

/* ------------------------------------------------------------------ */
/* Token tone helpers (mock type / score meter / accuracy)             */
/* ------------------------------------------------------------------ */

/** Mock-type chip tones, one mapping for this route. */
function typeChip(type: string): string {
  if (type === "full") return "bg-accent text-accent-foreground";
  if (type === "subject") return "bg-success/10 text-success";
  if (type === "sectional") return "bg-warning/10 text-warning";
  return "bg-muted text-muted-foreground";
}

/** Score-meter tone. Thresholds are the documented ones: ≥70 success,
 * ≥50 primary, below warning. Color never carries the value alone — the
 * number is always printed beside it. */
function scoreBarTone(pct: number): string {
  if (pct >= 70) return "bg-success";
  if (pct >= 50) return "bg-primary";
  return "bg-warning";
}

/** Accuracy chip tone: null reads as "not recorded", never as zero. */
function accuracyTone(accuracy: number | null): string {
  if (accuracy == null) return "bg-muted text-muted-foreground";
  if (accuracy >= 70) return "bg-success/10 text-success";
  if (accuracy >= 50) return "bg-muted text-muted-foreground";
  return "bg-warning/10 text-warning";
}

/** A signed delta on a Hairline badge, with exactly ONE sign. */
function DeltaBadge({
  value,
  unit = "pp",
  better = "up",
}: {
  value: number;
  unit?: string;
  /** Which direction is an improvement. Lower is better for time. */
  better?: "up" | "down";
}) {
  const flat = Math.abs(value) < 0.05;
  const rising = value > 0;
  const improved = flat ? null : better === "up" ? rising : !rising;
  const tone: BadgeTone = flat ? "neutral" : improved ? "success" : "danger";
  const text = flat
    ? "No change"
    : `${Math.round(Math.abs(value) * 10) / 10} ${unit}`;
  return (
    <Badge
      tone={tone}
      size="sm"
      icon={
        flat ? undefined : (
          <PlainIcon
            name={rising ? "arrowUpRight" : "arrowDownRight"}
            size={12}
            aria-hidden
          />
        )
      }
      aria-label={
        flat
          ? "No change"
          : `${text} ${improved ? "(improved)" : "(worse)"}`
      }
    >
      {text}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* The view                                                            */
/* ------------------------------------------------------------------ */

/** Memoized: the shell re-renders per chat token/keystroke; the ledger doesn't. */
export const CompareView = memo(function CompareView({
  data,
  isFetching,
  error,
  onRetry,
  onPageChange,
  onPageSizeChange,
  compared,
  selected,
  onToggle,
  onClear,
  onOpen,
  reference,
}: {
  /** The current server-paged picker page; undefined during first load. */
  data: PagedAttempts | undefined;
  isFetching: boolean;
  /** Present only when the picker page failed to load. */
  error?: Error | null;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  compared: Attempt[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  /** Opens the attempt detail dialog from a picker row. */
  onOpen?: (attempt: Attempt) => void;
  reference?: CompareReference;
}) {
  const attempts = data?.items ?? [];
  const firstLoad = data === undefined && !error;
  const comparison = useMemo(
    () => buildComparison(compared, reference),
    [compared, reference],
  );

  return (
    <>
      <section className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
          >
            <PlainIcon name="compare" size={16} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Choose your mocks ({compared.length}/4)
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
              Select two to four results. Filters and search narrow the list.
            </p>
          </div>
        </div>
        {error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <>
            <div
              className={cn(
                "divide-y divide-border transition-opacity",
                isFetching && !firstLoad && "opacity-60",
              )}
            >
              {firstLoad ? (
                <div className="space-y-2 p-4" role="status" aria-label="Loading mocks">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} shape="block" className="h-14 w-full" />
                  ))}
                </div>
              ) : attempts.length ? (
                attempts.map((a) => (
                  <PickerRow
                    key={a.id}
                    attempt={a}
                    checked={selected.includes(a.id)}
                    disabled={selected.length >= 4 && !selected.includes(a.id)}
                    onToggle={() => onToggle(a.id)}
                    onOpen={onOpen}
                  />
                ))
              ) : (
                <div className="py-10 px-5 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    No mocks match these filters.
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Widen the platform, subject or date range to find the
                    results you want to compare.
                  </p>
                </div>
              )}
            </div>
            {data && data.total > 0 && (
              <AttemptPagination
                page={data.page}
                pageCount={data.pageCount}
                total={data.total}
                pageSize={data.pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            )}
          </>
        )}
      </section>

      {selected.length > 0 && (
        <SelectionBar
          compared={compared}
          onToggle={onToggle}
          onClear={onClear}
        />
      )}

      {compared.length >= 2 ? (
        <ComparisonLedger comparison={comparison} reference={reference} />
      ) : (
        <div className="mt-4 rounded-2xl bg-card px-5 py-10 text-center text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
          <p className="text-lg font-semibold text-foreground">
            {compared.length === 1
              ? "One more to go."
              : "Pick two mocks to compare."}
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
            Comparing shows the score against each paper&apos;s target, the move
            from the previous attempt, and a subject-by-subject breakdown —
            with percentages wherever the maxima differ.
          </p>
        </div>
      )}
    </>
  );
});

function PickerRow({
  attempt,
  checked,
  disabled,
  onToggle,
  onOpen,
}: {
  attempt: Attempt;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  onOpen?: (attempt: Attempt) => void;
}) {
  const t = totals(attempt);
  const pct = comparable(t);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 px-4 py-3 transition-colors sm:px-6 lg:flex-nowrap",
        checked ? "bg-accent/70" : "hover:bg-accent/50",
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={`Select ${attempt.name} for comparison`}
        className="shrink-0"
      />
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          typeChip(attempt.type),
        )}
        aria-hidden="true"
      >
        <PlainIcon name="file" size={15} />
      </span>
      <span className="min-w-0 flex-1 basis-40">
        <span className="block truncate text-sm font-medium text-foreground">
          {attempt.name}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {attempt.platform} · {dateLabel(attempt.completedAt)} ·{" "}
          {istTimeLabel(attempt.completedAt)} · {typeName(attempt.type)}
        </span>
      </span>
      <span className="hidden sm:inline">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-[11px] font-medium",
            typeChip(attempt.type),
          )}
        >
          {typeName(attempt.type)}
        </span>
      </span>
      <span className="w-28 shrink-0">
        <span className="block text-[13px] font-medium tabular-nums text-foreground">
          {n(t.score)}
          <span className="text-xs font-normal text-muted-foreground"> / {t.maxScore}</span>
        </span>
        <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted">
          <span
            className={cn("block h-full rounded-full", scoreBarTone(pct))}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </span>
      </span>
      <span className="hidden md:inline">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-[11px] tabular-nums",
            accuracyTone(t.accuracy),
          )}
        >
          {t.accuracy == null ? "—" : `${n(t.accuracy)}%`}
        </span>
      </span>
      {onOpen && (
        <Button
          variant="outline"
          size="sm"
          aria-label={`View ${attempt.name}`}
          onClick={() => onOpen(attempt)}
        >
          <PlainIcon name="search" size={12} /> View
        </Button>
      )}
    </div>
  );
}

function SelectionBar({
  compared,
  onToggle,
  onClear,
}: {
  compared: Attempt[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {compared.length} of 4 selected
        </p>
        <p className="text-[11px] text-muted-foreground">
          Add up to two more results to widen the comparison.
        </p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {compared.map((a) => (
          <span
            key={a.id}
            className="inline-flex max-w-64 items-center gap-2 rounded-full bg-muted px-2.5 py-1.5 text-xs text-foreground"
          >
            <span className="truncate font-medium">{a.name}</span>
            <button
              type="button"
              aria-label={`Remove ${a.name} from the comparison`}
              onClick={() => onToggle(a.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            >
              <PlainIcon name="close" size={12} />
            </button>
          </span>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear all
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The comparison model                                                */
/* ------------------------------------------------------------------ */

type ComparisonRow = {
  key: string;
  label: string;
  hint?: string;
  /** One rendered value per compared attempt, aligned to `attempts`. */
  values: string[];
  /** Numeric value used for the difference column (percentage units). */
  numeric: (number | null)[];
  unit: string;
  /** Lower is better (pace). */
  better?: "up" | "down";
  diffable: boolean;
};

type Comparison = {
  attempts: Attempt[];
  totals: ReturnType<typeof totals>[];
  /** True when every selected attempt has the same maximum. */
  sameMax: boolean;
  rows: ComparisonRow[];
  subjectRows: {
    id: string;
    label: string;
    /** One cell per selected attempt, aligned by index; null means that mock
     * did not include this subject. */
    values: ({
      score: number;
      maxScore: number;
      percentage: number;
      accuracy: number | null;
      attempted: number;
    } | null)[];
    qualifying: boolean;
  }[];
  sectionRows: { id: string; label: string; values: (number | null)[] }[];
  previousIndex: number;
  targetHint: string | null;
};

/** The comparable percentage — score ÷ maximum, the only cross-paper figure. */
function comparable(t: ReturnType<typeof totals>): number {
  return t.maxScore ? (t.score / t.maxScore) * 100 : 0;
}

function buildComparison(
  attempts: Attempt[],
  reference?: CompareReference,
): Comparison {
  const tt = attempts.map((a) => totals(a));
  const sameMax =
    attempts.length > 0 && tt.every((t) => t.maxScore === tt[0]!.maxScore);
  const pct = tt.map(comparable);

  const targetRows: (number | null)[] = attempts.map((a) => {
    const target = reference?.targetFor(a);
    if (!target || target.maxScore === 0) return null;
    return (target.marks / target.maxScore) * 100;
  });
  const hasTarget = targetRows.some((v) => v != null);

  // "Previous" is the attempt immediately before this one in attempt-date
  // order, so the delta describes real progression rather than column order.
  const byDate = [...attempts].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt),
  );
  const previousIndex = attempts.length
    ? Math.max(
        0,
        byDate.findIndex((a) => a.id === attempts[attempts.length - 1]!.id) - 1,
      )
    : 0;

  const rows: ComparisonRow[] = [
    {
      key: "score",
      label: "Score",
      hint: sameMax ? undefined : "Different papers — read the percentage",
      values: tt.map((t) => `${n(t.score)} / ${n(t.maxScore)}`),
      numeric: tt.map((t) => t.score),
      unit: "marks",
      diffable: sameMax,
    },
    {
      key: "percentage",
      label: "Score percentage",
      hint: "Score ÷ maximum",
      values: tt.map((t) => `${n(t.percentage)}%`),
      numeric: pct,
      unit: "pp",
      diffable: true,
    },
    ...(hasTarget
      ? [
          {
            key: "vs-target",
            label: "Against target",
            hint: "Target for the attempt's own paper",
            values: attempts.map((a, i) => {
              const target = targetRows[i];
              return target == null
                ? "—"
                : `${pct[i]! >= target ? "+" : "−"}${n(Math.abs(pct[i]! - target))} pp · ${n(target)}% target`;
            }),
            numeric: attempts.map((_, i) =>
              targetRows[i] == null ? null : pct[i]! - targetRows[i]!,
            ),
            unit: "pp",
            diffable: false,
          } satisfies ComparisonRow,
        ]
      : []),
    {
      key: "accuracy",
      label: "Accuracy",
      hint: "Correct ÷ attempted",
      values: tt.map((t) => (t.accuracy == null ? "—" : `${n(t.accuracy)}%`)),
      numeric: tt.map((t) => t.accuracy),
      unit: "pp",
      diffable: true,
    },
    {
      key: "attempted",
      label: "Attempted",
      values: tt.map((t) => `${n(t.attempted)} / ${n(t.questions)}`),
      numeric: tt.map((t) =>
        t.questions ? (t.attempted / t.questions) * 100 : null,
      ),
      unit: "pp",
      diffable: true,
    },
    {
      key: "unattempted",
      label: "Left blank",
      hint: "Unattempted questions",
      values: tt.map((t) => n(t.unattempted)),
      numeric: tt.map((t) =>
        t.questions ? (t.unattempted / t.questions) * 100 : null,
      ),
      unit: "pp",
      diffable: true,
      better: "down",
    },
    {
      key: "time",
      label: "Time taken",
      values: tt.map((t) => formatTime(t.timeSeconds)),
      numeric: tt.map((t) => t.timeSeconds),
      unit: "s",
      diffable: true,
      better: "down",
    },
    {
      key: "pace",
      label: "Pace",
      hint: "Minutes per attempted question",
      values: tt.map((t) =>
        t.attempted && t.timeSeconds != null
          ? `${n(t.timeSeconds / 60 / t.attempted)} min`
          : "—",
      ),
      numeric: tt.map((t) =>
        t.attempted && t.timeSeconds != null
          ? t.timeSeconds / 60 / t.attempted
          : null,
      ),
      unit: "min",
      diffable: true,
      better: "down",
    },
    {
      key: "percentile",
      label: "Reported percentile",
      hint: "Only shown when the result sheet reported one",
      values: attempts.map((a) =>
        a.percentile == null ? "—" : `${n(a.percentile)}%`,
      ),
      numeric: attempts.map((a) => a.percentile ?? null),
      unit: "pp",
      diffable: false,
    },
  ];

  if (reference?.averagePercentage != null) {
    rows.push({
      key: "vs-average",
      label: "Against your average",
      hint: `Filtered average over ${reference.averageCount ?? 0} mock${reference.averageCount === 1 ? "" : "s"}`,
      values: pct.map(
        (value) =>
          `${value >= reference.averagePercentage! ? "+" : "−"}${n(
            Math.abs(value - reference.averagePercentage!),
          )} pp`,
      ),
      numeric: pct.map((value) => value - reference.averagePercentage!),
      unit: "pp",
      diffable: false,
    });
  }

  // Subject rows use the SAME rule as the Score row: qualifying subjects are
  // excluded, so subject marks add up to the merit total above them.
  // Every selected attempt gets a cell, aligned by index — a mock that does
  // not contain the subject shows "—" rather than shifting its neighbour's
  // value into the wrong column.
  const subjectRows = subjectIds
    .map((id) => {
      const values = attempts.map((a) => {
        const row = a.subjects.find((s) => s.subjectId === id);
        if (!row) return null;
        const stats = subjectStats(row, a.marking);
        return {
          score: stats.score,
          maxScore: stats.maxScore,
          percentage: stats.percentage,
          accuracy: stats.accuracy,
          attempted: stats.attempted,
          qualifying: row.qualifying,
        };
      });
      const present = values.filter(
        (v): v is NonNullable<(typeof values)[number]> => v != null,
      );
      if (!present.length) return null;
      return {
        id,
        label: SUBJECTS[id].short,
        values,
        // A subject is only a qualifying context when EVERY attempt that
        // scored it marked it qualifying.
        qualifying: present.every((v) => v.qualifying),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);

  const sectionRows = buildSectionRows(attempts);

  return {
    attempts,
    totals: tt,
    sameMax,
    rows,
    subjectRows,
    sectionRows,
    previousIndex,
    targetHint: hasTarget ? null : "No target set for these papers.",
  };
}

/** Section points for tiers that declare sections. Only merit sections are
 * compared (a qualifying Section III is a gate, not a score). */
function buildSectionRows(attempts: Attempt[]) {
  const perAttempt = attempts.map((attempt) => {
    const sections: readonly PatternSection[] = sectionsForAttempt(
      attempt.examId,
      attempt.tierId,
    );
    return sections
      .filter((section) => !section.qualifying)
      .flatMap((section) => {
        const children = attempt.subjects.filter((s) =>
          section.subjectIds.includes(s.subjectId),
        );
        if (children.length !== section.subjectIds.length) return [];
        const stats = children.map((s) => subjectStats(s, attempt.marking));
        const maxScore = stats.reduce((sum, s) => sum + s.maxScore, 0);
        const score = stats.reduce((sum, s) => sum + s.score, 0);
        return [
          {
            id: section.id as SectionId,
            label: section.name,
            percentage: maxScore ? (score / maxScore) * 100 : null,
          },
        ];
      });
  });
  return sectionIds
    .map((id) => {
      const values = perAttempt.map(
        (rows) => rows.find((row) => row.id === id)?.percentage ?? null,
      );
      if (values.every((v) => v == null)) return null;
      const label =
        perAttempt
          .flat()
          .find((row) => row.id === id)?.label ?? id;
      return { id, label, values };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

/* ------------------------------------------------------------------ */
/* The insight stack                                                   */
/* ------------------------------------------------------------------ */

function ComparisonLedger({
  comparison,
  reference,
}: {
  comparison: Comparison;
  reference?: CompareReference;
}) {
  const { attempts, rows, sameMax } = comparison;

  return (
    <div className="mt-4 space-y-4">
      {/* Subject shape, first vs last — the same pair the Change column reads. */}
      <SubjectComparisonBars comparison={comparison} />

      {/* The selected mocks read against your filtered average. */}
      <AverageThreshold
        attempts={attempts}
        average={reference?.averagePercentage ?? null}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(["percentage", "accuracy", "vs-target", "pace"] as const).map(
          (key) => {
            const row = rows.find((r) => r.key === key);
            if (!row) return null;
            return (
              <div
                key={key}
                className="rounded-xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {row.label}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {attempts.map((a, i) => (
                    <li key={a.id} className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-[11px] text-muted-foreground">
                        {a.platform}
                      </span>
                      <span className="shrink-0 text-base font-semibold leading-none tabular-nums text-foreground">
                        {row.values[i]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          },
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pb-3 pt-4">
          <h2 className="text-base font-semibold text-foreground">Attempt comparison</h2>
          {!sameMax && (
            <p className="text-[11px] text-muted-foreground">
              These mocks have different maxima, so percentages carry the
              comparison.
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full tabular-nums">
            <caption className="sr-only">
              Selected mock results compared side by side
            </caption>
            <thead>
              <tr className="border-y border-border">
                <th scope="col" className="sticky left-0 z-[1] bg-card px-5 py-2 text-left text-xs font-medium text-muted-foreground">
                  Metric
                </th>
                {attempts.map((a) => (
                  <th key={a.id} scope="col" className="min-w-40 px-3 py-2 text-left">
                    <span className="block text-xs font-semibold text-foreground">
                      {a.name}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {typeName(a.type)} · {dateLabel(a.completedAt)}
                    </span>
                  </th>
                ))}
                <th scope="col" className="min-w-28 px-5 py-2 text-left text-xs font-medium text-muted-foreground">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-b-0">
                  <th scope="row" className="sticky left-0 z-[1] bg-card px-5 py-2.5 text-left text-xs font-normal text-muted-foreground">
                    {row.label}
                    {row.hint && (
                      <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                        {row.hint}
                      </span>
                    )}
                  </th>
                  {attempts.map((a, i) => (
                    <td key={a.id} className="px-3 py-2.5 text-[13px] text-foreground">
                      {row.values[i]}
                    </td>
                  ))}
                  <td className="px-5 py-2.5">
                    <ChangeCell
                      row={row}
                      firstIndex={0}
                      secondIndex={attempts.length - 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        <h2 className="px-5 pb-3 pt-4 text-base font-semibold text-foreground">
          Subject comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full tabular-nums">
            <caption className="sr-only">
              Subject-wise comparison for the selected mocks
            </caption>
            <thead>
              <tr className="border-y border-border">
                <th scope="col" className="sticky left-0 z-[1] bg-card px-5 py-2 text-left text-xs font-medium text-muted-foreground">
                  Subject
                </th>
                {attempts.map((a) => (
                  <th key={a.id} scope="col" className="min-w-36 px-3 py-2 text-left">
                    <span className="block text-xs font-semibold text-foreground">
                      {a.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.subjectRows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <th scope="row" className="sticky left-0 z-[1] bg-card px-5 py-2.5 text-left text-xs font-medium text-foreground">
                    {row.label}
                    {row.qualifying && (
                      <span className="ml-1.5 text-[11px] font-normal uppercase tracking-wide text-muted-foreground">
                        qualifying
                      </span>
                    )}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={attempts[index]!.id} className="min-w-36 px-3 py-2.5">
                      {value == null ? (
                        <span className="text-xs text-muted-foreground">
                          Not in this mock
                        </span>
                      ) : (
                        <>
                          <p className="text-[13px] text-foreground">
                            <span className="font-medium">
                              {n(value.score)} / {n(value.maxScore)}
                            </span>{" "}
                            <span className="text-xs text-muted-foreground">
                              ({n(value.percentage)}%)
                            </span>
                          </p>
                          <span className="mt-1 block h-1 w-24 overflow-hidden rounded-full bg-muted">
                            <span
                              className={cn("block h-full rounded-full", scoreBarTone(value.percentage))}
                              style={{ width: `${Math.min(100, Math.max(0, value.percentage))}%` }}
                            />
                          </span>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {n(value.attempted)} attempted ·{" "}
                            {value.accuracy == null ? "—" : `${n(value.accuracy)}% accuracy`}
                          </p>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {comparison.sectionRows.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
          <div className="px-5 pb-3 pt-4">
            <h2 className="text-base font-semibold text-foreground">Section comparison</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Section I and II are summed from each full mock&apos;s subject
              results. A qualifying section is never included.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full tabular-nums">
              <caption className="sr-only">
                Section-wise score percentages for the selected mocks
              </caption>
              <thead>
                <tr className="border-y border-border">
                  <th scope="col" className="sticky left-0 z-[1] bg-card px-5 py-2 text-left text-xs font-medium text-muted-foreground">
                    Section
                  </th>
                  {attempts.map((a) => (
                    <th key={a.id} scope="col" className="px-5 py-2 text-left text-xs font-semibold text-foreground">
                      {a.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.sectionRows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    <th scope="row" className="sticky left-0 z-[1] bg-card px-5 py-2.5 text-left text-xs font-normal text-foreground">
                      {row.label}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={attempts[index]!.id} className="px-5 py-2.5 text-[13px] text-foreground">
                        {value == null ? "—" : `${n(value)}%`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {attempts.length === 2
          ? `Change compares ${attempts[1]!.name} with ${attempts[0]!.name}.`
          : `Change compares the last selected mock (${attempts[attempts.length - 1]!.name}) with the first (${attempts[0]!.name}).`}
      </p>
    </div>
  );
}

/** CompareBars over the subjects both end-mocks share: the later mock
 * against the earlier one, the pair the Change column also reads. */
function SubjectComparisonBars({ comparison }: { comparison: Comparison }) {
  const { attempts, subjectRows } = comparison;
  const first = attempts[0]!;
  const last = attempts[attempts.length - 1]!;

  // Only subjects both end-mocks actually contain — a missing subject is
  // not a zero, and the table beside this chart carries the gaps.
  const data: CompareBarsDatum[] = [];
  for (const row of subjectRows) {
    const firstValue = row.values[0];
    const lastValue = row.values[attempts.length - 1];
    if (!firstValue || !lastValue) continue;
    data.push({
      key: row.id,
      label: row.label,
      title: SUBJECTS[row.id as keyof typeof SUBJECTS]?.name ?? row.label,
      current: lastValue.percentage,
      previous: firstValue.percentage,
    });
  }

  if (!data.length) return null;

  return (
    <CompareBars
      data={data}
      title="Score percentage by subject"
      currentLabel={last.name}
      previousLabel={first.name}
      format={{ maximumFractionDigits: 1 }}
    />
  );
}

/** ThresholdLine over the selected mocks' percentages, seeded at the
 * filtered average; the line drags so any cut-off can be tested. */
function AverageThreshold({
  attempts,
  average,
}: {
  attempts: Attempt[];
  average: number | null;
}) {
  const [line, setLine] = useState<number | null>(null);
  if (average == null || attempts.length < 2) return null;

  const data: ThresholdLineDatum[] = attempts.map((a) => {
    const t = totals(a);
    return {
      key: a.id,
      value: comparable(t),
      label: a.name,
      tick: dateLabel(a.completedAt),
    };
  });

  return (
    <ThresholdLine
      data={data}
      value={line ?? average}
      onValueChange={setLine}
      onValueCommit={setLine}
      direction="above"
      title="Score percentage, against the line"
      period={`of the ${attempts.length} selected mocks sit above it — drag to test any cut-off`}
      label="score percentage threshold"
      format={{ maximumFractionDigits: 1 }}
    />
  );
}

function ChangeCell({
  row,
  firstIndex,
  secondIndex,
}: {
  row: ComparisonRow;
  firstIndex: number;
  secondIndex: number;
}) {
  // Two-way compares first vs second; a wider selection compares the FIRST
  // and LAST columns, which is the overall movement across the comparison.
  // Rendering "—" for every 3-4 way row made the column look broken.
  if (!row.diffable) return <span className="text-xs text-muted-foreground">—</span>;
  const a = row.numeric[firstIndex];
  const b = row.numeric[secondIndex];
  if (a == null || b == null) return <span className="text-xs text-muted-foreground">—</span>;
  const value = row.unit === "s" ? (b - a) / 60 : b - a;
  const unit = row.unit === "s" ? "min" : row.unit;
  return <DeltaBadge value={value} unit={unit} better={row.better ?? "up"} />;
}

function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <Alert
      tone="danger"
      title="The mock list could not be loaded."
      action={
        onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <PlainIcon name="refresh" size={13} /> Try again
          </Button>
        )
      }
      className="m-4"
    >
      {error.message || "Check your connection, then try again."}
    </Alert>
  );
}
