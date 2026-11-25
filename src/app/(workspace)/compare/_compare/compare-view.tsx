"use client";
import { memo, useMemo, useRef, useState, type ReactNode } from "react";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Badge, type BadgeTone } from "@/components/badge";
import { Alert } from "@/components/alert";
import { SegmentedControl } from "@/components/segmented-control";
import { CompareBars, type CompareBarsDatum } from "@/components/compare-bars";
import {
  ThresholdLine,
  type ThresholdLineDatum,
} from "@/components/threshold-line";
import { AttemptPagination } from "@/components/attempt-pagination";
import { scoreBarTone } from "@/components/attempt-display";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { AttemptCard, AttemptCardSkeleton } from "@/components/attempt-card";

/**
 * Compare — a slot tray, a card picker, and a read-out.
 *
 * The page answers three questions:
 *   · Where did this result land against the target for its own paper?
 *   · How did it move from the previous attempt?
 *   · How does it sit against the filtered average?
 *
 * Deltas are measured on percentages, because the selected mocks may have
 * different maxima; raw marks are only ranked when the maxima match, and the
 * read-out says so when they do not.
 *
 * What changed in this revision (UI only — `buildComparison` below is the
 * original model, untouched):
 *
 *  · The picker is a grid of `AttemptCard`s in select mode (shared with
 *    /history) instead of a divided list of loose flex rows that wrapped
 *    unpredictably. It scrolls inside a ScrollArea on large screens so the
 *    read-out stays close to the selection.
 *  · A four-slot tray (A–D) shows what is selected and what is still free; the
 *    letters follow each mock into every card and column below, so a reader
 *    never has to match names by eye.
 *  · The read-out opens with one head card per mock, then the two charts, then
 *    the detail as head-to-head metric cards. Each card ranks the mocks on one
 *    measure, scales a bar across them and marks the leader. The dense ledger
 *    tables remain as an explicit second view from `md` up.
 */

type CompareViewMode = "cards" | "table";

const dateLabel = shortDate;
const typeName = mockTypeLabel;

const MAX_COMPARE = 4;
const SLOT_LETTERS = ["A", "B", "C", "D"] as const;
const slotOf = (index: number) => SLOT_LETTERS[index] ?? String(index + 1);

export type CompareReference = {
  /** Target for a tier, keyed "examId:tierId". */
  targetFor: (attempt: Attempt) => { marks: number; maxScore: number } | null;
  /** Average percentage across the current filtered set, when available. */
  averagePercentage: number | null;
  averageCount: number | null;
};

const SUBJECT_HUE: Record<string, string> = {
  quant: "var(--chart-1)",
  reasoning: "var(--chart-2)",
  english: "var(--chart-3)",
  ga: "var(--chart-4)",
  computer: "var(--chart-5)",
};

/* ------------------------------------------------------------------ */
/* Small parts                                                         */
/* ------------------------------------------------------------------ */

/** The slot letter that ties a mock to its card, tray slot and table column. */
function SlotBadge({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid size-5 shrink-0 place-items-center rounded-md bg-foreground text-[10.5px] font-semibold leading-none text-background",
        className,
      )}
    >
      {slotOf(index)}
    </span>
  );
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
        flat ? "No change" : `${text} ${improved ? "(improved)" : "(worse)"}`
      }
    >
      {text}
    </Badge>
  );
}

function CardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
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
  /** Opens the attempt detail dialog from a picker card. */
  onOpen?: (attempt: Attempt) => void;
  reference?: CompareReference;
}) {
  const attempts = data?.items ?? [];
  const firstLoad = data === undefined && !error;
  const refreshing = isFetching && !firstLoad;
  const [viewMode, setViewMode] = useState<CompareViewMode>("cards");
  const resultsRef = useRef<HTMLDivElement>(null);
  const comparison = useMemo(
    () => buildComparison(compared, reference),
    [compared, reference],
  );
  const full = selected.length >= MAX_COMPARE;

  const jumpToResults = () =>
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });

  return (
    <div className="min-w-0 space-y-5">
      <section
        aria-label="Choose mocks to compare"
        className="min-w-0 rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
            >
              <PlainIcon name="compare" size={17} tone="primary" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-snug tracking-[-0.01em] text-foreground">
                Choose your mocks
              </h2>
              <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                Select two to four results. Filters and search narrow the list.
              </p>
            </div>
          </div>
          {refreshing && (
            <span
              role="status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Updating…
            </span>
          )}
        </div>

        <SelectionTray
          compared={compared}
          selectedCount={selected.length}
          onRemove={onToggle}
          onClear={onClear}
          onJump={jumpToResults}
        />

        {error ? (
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
        ) : (
          <>
            {firstLoad ? (
              <div
                className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-3 px-4 pb-4 sm:px-5"
                role="status"
                aria-label="Loading mocks"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <AttemptCardSkeleton key={i} />
                ))}
              </div>
            ) : attempts.length ? (
              // A bounded, scrollable list from `lg` up keeps the read-out near
              // the selection; on phones the page itself scrolls.
              <ScrollArea
                className="lg:max-h-152"
                viewportClassName="lg:max-h-[38rem]"
              >
                <ul
                  aria-label="Saved mock results"
                  className={cn(
                    "grid grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-3 px-4 pb-4 pt-1 transition-opacity duration-150 motion-reduce:transition-none sm:px-5",
                    refreshing && "opacity-60",
                  )}
                >
                  {attempts.map((attempt) => {
                    const isSelected = selected.includes(attempt.id);
                    return (
                      <li key={attempt.id} className="flex min-w-0">
                        <AttemptCard
                          attempt={attempt}
                          mode="select"
                          selected={isSelected}
                          disabled={full && !isSelected}
                          onSelectedChange={() => onToggle(attempt.id)}
                          onOpen={onOpen}
                          className="w-full"
                        />
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <div className="px-5 pb-8 pt-4 text-center">
                <p className="text-base font-semibold text-foreground">
                  No mocks match these filters.
                </p>
                <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                  Widen the platform, subject or date range to find the results
                  you want to compare.
                </p>
              </div>
            )}
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

      <div ref={resultsRef} className="scroll-mt-4">
        {compared.length >= 2 ? (
          <ComparisonResults
            comparison={comparison}
            reference={reference}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        ) : (
          <ComparePlaceholder count={compared.length} />
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Selection tray                                                      */
/* ------------------------------------------------------------------ */

function SelectionTray({
  compared,
  selectedCount,
  onRemove,
  onClear,
  onJump,
}: {
  compared: Attempt[];
  selectedCount: number;
  onRemove: (id: string) => void;
  onClear: () => void;
  onJump: () => void;
}) {
  const ready = compared.length >= 2;
  return (
    <div className="mx-4 mb-4 rounded-xl bg-muted/50 p-3 shadow-[inset_0_0_0_1px_var(--border)] sm:mx-5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-[12.5px] font-medium text-foreground"
          aria-live="polite"
        >
          {selectedCount === 0
            ? "No mocks selected"
            : `${selectedCount} of ${MAX_COMPARE} selected`}
          <span className="font-normal text-muted-foreground">
            {selectedCount < 2
              ? " · pick at least two"
              : selectedCount < MAX_COMPARE
                ? " · add more to widen it"
                : " · selection full"}
          </span>
        </p>
        <div className="flex items-center gap-1.5">
          {selectedCount > 0 && (
            <Button variant="ghost" size="xs" onClick={onClear}>
              Clear all
            </Button>
          )}
          <Button
            variant="primary"
            size="xs"
            disabled={!ready}
            onClick={onJump}
            icon={
              <PlainIcon name="arrowRight" size={12} className="rotate-90" />
            }
          >
            View comparison
          </Button>
        </div>
      </div>
      <ol
        className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-4"
        aria-label="Comparison slots"
      >
        {SLOT_LETTERS.map((letter, index) => {
          const attempt = compared[index];
          return attempt ? (
            <li
              key={attempt.id}
              className="flex min-w-0 items-center gap-2 rounded-lg bg-card py-1.5 pl-2 pr-1 shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <SlotBadge index={index} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium leading-tight text-foreground">
                  {attempt.name}
                </span>
                <span className="block truncate text-[10.5px] leading-tight text-muted-foreground">
                  {attempt.platform} · {dateLabel(attempt.completedAt)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${attempt.name} from the comparison`}
                onClick={() => onRemove(attempt.id)}
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <PlainIcon name="close" size={12} />
              </button>
            </li>
          ) : (
            <li
              key={letter}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-dashed border-border px-2 py-2 text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="inline-grid size-5 shrink-0 place-items-center rounded-md border border-border text-[10.5px] font-semibold leading-none"
              >
                {letter}
              </span>
              <span className="truncate text-[12px]">
                {index < 2 ? "Required" : "Optional"} · empty slot
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ComparePlaceholder({ count }: { count: number }) {
  return (
    <CardShell className="px-5 py-10 text-center sm:py-12">
      <span
        aria-hidden="true"
        className="mx-auto grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"
      >
        <PlainIcon name="compare" size={20} tone="primary" />
      </span>
      <p className="mt-4 text-lg font-semibold tracking-[-0.01em] text-foreground">
        {count === 1 ? "One more to go." : "Pick two mocks to compare."}
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        The read-out ranks every measure across your picks, charts the subject
        shape, and uses percentages wherever the paper maxima differ.
      </p>
      <ul className="mx-auto mt-6 grid max-w-2xl gap-2 text-left sm:grid-cols-3">
        {[
          {
            icon: "target",
            title: "Against target",
            body: "Each paper's own target line.",
          },
          {
            icon: "trend",
            title: "Move over time",
            body: "First to last, in points.",
          },
          {
            icon: "layers",
            title: "Subject by subject",
            body: "Same hues, side by side.",
          },
        ].map((item) => (
          <li
            key={item.title}
            className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3"
          >
            <PlainIcon
              name={item.icon as "target" | "trend" | "layers"}
              size={15}
              tone="primary"
              className="mt-0.5 shrink-0"
            />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium text-foreground">
                {item.title}
              </span>
              <span className="block text-[11.5px] leading-snug text-muted-foreground">
                {item.body}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */
/* The comparison model (unchanged)                                    */
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
            values: attempts.map((_a, i) => {
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
      const label = perAttempt.flat().find((row) => row.id === id)?.label ?? id;
      return { id, label, values };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

/* ------------------------------------------------------------------ */
/* The read-out                                                        */
/* ------------------------------------------------------------------ */

const HEAD_COLS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function ComparisonResults({
  comparison,
  reference,
  viewMode,
  setViewMode,
}: {
  comparison: Comparison;
  reference?: CompareReference;
  viewMode: CompareViewMode;
  setViewMode: (mode: CompareViewMode) => void;
}) {
  const { attempts, sameMax, rows, subjectRows, sectionRows } = comparison;

  const barData = useMemo(() => buildBarData(comparison), [comparison]);
  const average = reference?.averagePercentage ?? null;
  const hasThreshold = average != null && attempts.length >= 2;
  const chartCols =
    barData.length && hasThreshold ? "xl:grid-cols-2" : "xl:grid-cols-1";

  const cards = (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
          Measures
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18.5rem),1fr))] gap-3">
          {rows.map((row) => (
            <MetricCompareCard
              key={row.key}
              row={row}
              attempts={attempts}
              sameMax={sameMax}
            />
          ))}
        </div>
      </div>
      {subjectRows.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
            Subjects
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18.5rem),1fr))] gap-3">
            {subjectRows.map((row) => (
              <SubjectCompareCard key={row.id} row={row} attempts={attempts} />
            ))}
          </div>
        </div>
      )}
      {sectionRows.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sections
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18.5rem),1fr))] gap-3">
            {sectionRows.map((row) => (
              <SectionCompareCard key={row.id} row={row} attempts={attempts} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-w-0 space-y-5">
      <SectionHeading
        title="Comparison"
        description={
          sameMax
            ? `${attempts.length} mocks on the same maximum — marks and percentages both rank.`
            : "These mocks have different maxima, so percentages carry the comparison."
        }
      />

      {/* One head card per mock */}
      <ul
        aria-label="Compared mocks"
        className={cn(
          "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2",
          HEAD_COLS[attempts.length] ?? "lg:grid-cols-4",
        )}
      >
        {attempts.map((attempt, i) => (
          <HeadCard
            key={attempt.id}
            attempt={attempt}
            index={i}
            pct={comparable(comparison.totals[i]!)}
            baselinePct={comparable(comparison.totals[0]!)}
          />
        ))}
      </ul>

      {(barData.length > 0 || hasThreshold) && (
        <div className={cn("grid grid-cols-1 items-start gap-4", chartCols)}>
          {barData.length > 0 && (
            <CompareBars
              data={barData}
              title="Score percentage by subject"
              currentLabel={attempts[attempts.length - 1]!.name}
              previousLabel={attempts[0]!.name}
              format={{ maximumFractionDigits: 1 }}
            />
          )}
          {hasThreshold && (
            <AverageThreshold attempts={attempts} average={average} />
          )}
        </div>
      )}

      <div className="space-y-4">
        <SectionHeading
          title="Detail"
          description="Every measure, ranked across your picks. The best result on each is marked."
          action={
            <span className="hidden md:block">
              <SegmentedControl
                label="Detail layout"
                size="sm"
                value={viewMode}
                onValueChange={(value) => setViewMode(value as CompareViewMode)}
                options={[
                  { value: "cards", label: "Cards" },
                  { value: "table", label: "Table" },
                ]}
              />
            </span>
          }
        />
        {viewMode === "cards" ? (
          cards
        ) : (
          <>
            <div className="md:hidden">{cards}</div>
            <div className="hidden space-y-4 md:block">
              <LedgerTable
                caption="Selected mock results compared side by side"
                firstHeader="Metric"
                attempts={attempts}
                withChange
                rows={rows.map((row) => ({
                  key: row.key,
                  label: row.label,
                  hint: row.hint,
                  cells: attempts.map((_, i) => row.values[i]),
                  change: (
                    <ChangeCell
                      row={row}
                      firstIndex={0}
                      secondIndex={attempts.length - 1}
                    />
                  ),
                }))}
              />
              <LedgerTable
                caption="Subject-wise comparison for the selected mocks"
                firstHeader="Subject"
                attempts={attempts}
                rows={subjectRows.map((row) => ({
                  key: row.id,
                  label: row.label,
                  hint: row.qualifying ? "Qualifying" : undefined,
                  cells: row.values.map((value) =>
                    value == null ? (
                      <span
                        key="none"
                        className="text-xs text-muted-foreground"
                      >
                        Not in this mock
                      </span>
                    ) : (
                      <span key="v" className="block">
                        <span className="text-[13px] font-medium text-foreground">
                          {n(value.score)} / {n(value.maxScore)}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground">
                          ({n(value.percentage)}%)
                        </span>
                        <span className="mt-1 block h-1 w-24 overflow-hidden rounded-full bg-muted">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              scoreBarTone(value.percentage),
                            )}
                            style={{
                              width: `${Math.min(100, Math.max(0, value.percentage))}%`,
                            }}
                          />
                        </span>
                      </span>
                    ),
                  ),
                }))}
              />
              {sectionRows.length > 0 && (
                <LedgerTable
                  caption="Section-wise comparison for the selected mocks"
                  firstHeader="Section"
                  attempts={attempts}
                  rows={sectionRows.map((row) => ({
                    key: row.id,
                    label: row.label,
                    cells: row.values.map((value) =>
                      value == null ? "—" : `${n(value)}%`,
                    ),
                  }))}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- head card */

function HeadCard({
  attempt,
  index,
  pct,
  baselinePct,
}: {
  attempt: Attempt;
  index: number;
  pct: number;
  baselinePct: number;
}) {
  const t = totals(attempt);
  return (
    <li className="min-w-0">
      <CardShell className="flex h-full flex-col p-4">
        <div className="flex items-start gap-2.5">
          <SlotBadge index={index} className="mt-0.5" />
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground">
              {attempt.name}
            </h3>
            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
              {attempt.platform} · {dateLabel(attempt.completedAt)} ·{" "}
              {istTimeLabel(attempt.completedAt)}
            </p>
          </div>
        </div>
        <p className="mt-4 flex items-baseline gap-1.5 tabular-nums">
          <span className="text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            {n(pct)}
          </span>
          <span className="text-[13px] font-medium text-muted-foreground">
            %
          </span>
        </p>
        <p className="mt-1 text-[12px] tabular-nums text-muted-foreground">
          {n(t.score, 2)} / {n(t.maxScore, 0)} · {typeName(attempt.type)}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", scoreBarTone(pct))}
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
        <div className="mt-auto flex items-center gap-2 pt-3.5">
          {index === 0 ? (
            <Badge tone="neutral" size="sm">
              Baseline
            </Badge>
          ) : (
            <>
              <DeltaBadge value={pct - baselinePct} unit="pp" />
              <span className="text-[11px] text-muted-foreground">vs A</span>
            </>
          )}
        </div>
      </CardShell>
    </li>
  );
}

/* --------------------------------------------------------- metric card */

/** Rows that read as "which mock is best on this?". Gap rows (against target,
 * against average) are signed offsets, so they list but do not draw bars. */
const BAR_KEYS = new Set([
  "score",
  "percentage",
  "accuracy",
  "attempted",
  "unattempted",
  "time",
  "pace",
  "percentile",
]);

function leaderOf(row: ComparisonRow, sameMax: boolean): number | null {
  if (row.key === "score" && !sameMax) return null;
  const present = row.numeric
    .map((value, index) => ({ value, index }))
    .filter(
      (entry): entry is { value: number; index: number } => entry.value != null,
    );
  if (present.length < 2) return null;
  if (present.every((entry) => entry.value === present[0]!.value)) return null;
  const down = row.better === "down";
  const best = present.reduce((a, b) =>
    down ? (b.value < a.value ? b : a) : b.value > a.value ? b : a,
  );
  return best.index;
}

function MetricCompareCard({
  row,
  attempts,
  sameMax,
}: {
  row: ComparisonRow;
  attempts: Attempt[];
  sameMax: boolean;
}) {
  const leader = leaderOf(row, sameMax);
  const bars = BAR_KEYS.has(row.key) && !(row.key === "score" && !sameMax);
  const max = Math.max(
    ...row.numeric.map((value) => (value == null ? 0 : Math.abs(value))),
    0,
  );
  const first = row.numeric[0];
  const last = row.numeric[attempts.length - 1];
  const showChange = row.diffable && first != null && last != null;

  return (
    <CardShell className="flex min-w-0 flex-col p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[12.5px] font-semibold text-foreground">
          {row.label}
        </h4>
        {row.hint && (
          <span
            className="truncate text-[10.5px] text-muted-foreground"
            title={row.hint}
          >
            {row.hint}
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-3">
        {attempts.map((attempt, i) => {
          const value = row.numeric[i];
          const isLeader = leader === i;
          const width =
            bars && value != null && max > 0
              ? Math.max(3, (Math.abs(value) / max) * 100)
              : 0;
          return (
            <li key={attempt.id} className="min-w-0">
              <div className="flex items-center gap-2">
                <SlotBadge index={i} />
                <span
                  className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground"
                  title={attempt.name}
                >
                  {attempt.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-right text-[13px] font-semibold tabular-nums",
                    isLeader ? "text-success" : "text-foreground",
                  )}
                >
                  {row.values[i]}
                </span>
                {isLeader && <span className="sr-only"> (best)</span>}
              </div>
              {bars && (
                <div className="mt-1.5 flex items-center gap-1.5 pl-7">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        isLeader ? "bg-success" : "bg-foreground/25",
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  {isLeader && (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-success"
                    >
                      Best
                    </span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {showChange && (
        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-[11px] text-muted-foreground">
            Change {slotOf(0)} → {slotOf(attempts.length - 1)}
          </span>
          <ChangeCell
            row={row}
            firstIndex={0}
            secondIndex={attempts.length - 1}
          />
        </div>
      )}
    </CardShell>
  );
}

function SubjectCompareCard({
  row,
  attempts,
}: {
  row: Comparison["subjectRows"][number];
  attempts: Attempt[];
}) {
  const hue = SUBJECT_HUE[row.id] ?? "var(--chart-1)";
  const present = row.values
    .map((value, index) => ({ value, index }))
    .filter(
      (
        entry,
      ): entry is { value: NonNullable<typeof entry.value>; index: number } =>
        entry.value != null,
    );
  const top =
    present.length > 1
      ? Math.max(...present.map((entry) => entry.value.percentage))
      : null;
  return (
    <CardShell className="min-w-0 p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-[3px]"
          style={{ background: hue }}
        />
        <h4 className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground">
          {SUBJECTS[row.id as keyof typeof SUBJECTS]?.name ?? row.label}
        </h4>
        {row.qualifying && (
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-muted-foreground">
            Qualifying
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-3">
        {row.values.map((value, i) => (
          <li key={attempts[i]!.id} className="min-w-0">
            <div className="flex items-center gap-2">
              <SlotBadge index={i} />
              <span
                className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground"
                title={attempts[i]!.name}
              >
                {attempts[i]!.name}
              </span>
              {value == null ? (
                <span className="shrink-0 text-[11.5px] text-muted-foreground">
                  Not in this mock
                </span>
              ) : (
                <span
                  className={cn(
                    "shrink-0 text-[13px] font-semibold tabular-nums",
                    top != null && value.percentage === top
                      ? "text-success"
                      : "text-foreground",
                  )}
                >
                  {n(value.percentage)}%
                </span>
              )}
            </div>
            {value != null && (
              <>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, value.percentage))}%`,
                      background: hue,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                  {n(value.score)} / {n(value.maxScore)} · {n(value.attempted)}{" "}
                  attempted ·{" "}
                  {value.accuracy == null
                    ? "—"
                    : `${n(value.accuracy)}% accuracy`}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

function SectionCompareCard({
  row,
  attempts,
}: {
  row: Comparison["sectionRows"][number];
  attempts: Attempt[];
}) {
  const present = row.values.filter((value): value is number => value != null);
  const top = present.length > 1 ? Math.max(...present) : null;
  return (
    <CardShell className="min-w-0 p-4">
      <h4 className="text-[12.5px] font-semibold text-foreground">
        {row.label}
      </h4>
      <ul className="mt-3 space-y-3">
        {row.values.map((value, i) => (
          <li key={attempts[i]!.id} className="min-w-0">
            <div className="flex items-center gap-2">
              <SlotBadge index={i} />
              <span
                className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground"
                title={attempts[i]!.name}
              >
                {attempts[i]!.name}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[13px] font-semibold tabular-nums",
                  value != null && top != null && value === top
                    ? "text-success"
                    : "text-foreground",
                )}
              >
                {value == null ? "—" : `${n(value)}%`}
              </span>
            </div>
            {value != null && (
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", scoreBarTone(value))}
                  style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

/* --------------------------------------------------------------- table */

type LedgerRowModel = {
  key: string;
  label: string;
  hint?: string;
  cells: ReactNode[];
  change?: ReactNode;
};

function LedgerTable({
  caption,
  firstHeader,
  attempts,
  rows,
  withChange = false,
}: {
  caption: string;
  firstHeader: string;
  attempts: Attempt[];
  rows: LedgerRowModel[];
  withChange?: boolean;
}) {
  return (
    <CardShell className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-136 tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th
                scope="col"
                className="sticky left-0 z-1 bg-muted/40 px-5 py-2.5 text-left text-xs font-medium text-muted-foreground"
              >
                {firstHeader}
              </th>
              {attempts.map((attempt, i) => (
                <th
                  key={attempt.id}
                  scope="col"
                  className="min-w-40 px-3 py-2.5 text-left align-top"
                >
                  <span className="flex items-start gap-2">
                    <SlotBadge index={i} className="mt-px" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {attempt.name}
                      </span>
                      <span className="block truncate text-[11px] font-normal text-muted-foreground">
                        {typeName(attempt.type)} ·{" "}
                        {dateLabel(attempt.completedAt)}
                      </span>
                    </span>
                  </span>
                </th>
              ))}
              {withChange && (
                <th
                  scope="col"
                  className="min-w-28 px-5 py-2.5 text-left text-xs font-medium text-muted-foreground"
                >
                  Change
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-border last:border-b-0"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-1 bg-card px-5 py-2.5 text-left text-xs font-medium text-foreground"
                >
                  {row.label}
                  {row.hint && (
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground/80">
                      {row.hint}
                    </span>
                  )}
                </th>
                {row.cells.map((cell, i) => (
                  <td
                    key={attempts[i]!.id}
                    className="px-3 py-2.5 text-[13px] text-foreground"
                  >
                    {cell}
                  </td>
                ))}
                {withChange && <td className="px-5 py-2.5">{row.change}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}

/* -------------------------------------------------------------- charts */

/** CompareBars over the subjects both end-mocks share: the later mock
 * against the earlier one, the pair the Change column also reads. A missing
 * subject is not a zero, and the cards beside this chart carry the gaps. */
function buildBarData(comparison: Comparison): CompareBarsDatum[] {
  const { attempts, subjectRows } = comparison;
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
  return data;
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

  const data: ThresholdLineDatum[] = attempts.map((a, i) => ({
    key: a.id,
    value: comparable(totals(a)),
    label: `${slotOf(i)} · ${a.name}`,
    tick: dateLabel(a.completedAt),
  }));

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
  if (!row.diffable)
    return <span className="text-xs text-muted-foreground">—</span>;
  const a = row.numeric[firstIndex];
  const b = row.numeric[secondIndex];
  if (a == null || b == null)
    return <span className="text-xs text-muted-foreground">—</span>;
  const value = row.unit === "s" ? (b - a) / 60 : b - a;
  const unit = row.unit === "s" ? "min" : row.unit;
  return <DeltaBadge value={value} unit={unit} better={row.better ?? "up"} />;
}
