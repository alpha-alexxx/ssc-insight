"use client";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { analyticsQueryOptions } from "@/lib/queries/analytics";
import { allAttemptsQueryOptions } from "@/lib/queries/attempts";
import { useExamScope } from "@/components/exam-context";
import type { Analytics } from "@/lib/analytics";
import type { Attempt, DashboardScope, Filters } from "@/lib/domain";

/** Stable identity while a query is pending — a fresh `[]` defeats memo. */
const EMPTY_ATTEMPTS: Attempt[] = [];

/**
 * The analytics payload, its target reference, and the unfiltered attempt list
 * for ONE route.
 *
 * Extracted from the old workspace shell, which fetched this for every view and
 * then handed it down as props. Two things it must preserve:
 *
 * - **`keepPreviousData`** holds the previous charts on screen while a new
 *   filter combination loads, so a scope switch does not flash an empty state.
 * - **The target is resolved on the server for the tier being viewed** and
 *   arrives with the exam payload (`useExamScope`). There is deliberately no
 *   second settings query here — a target must never be able to disagree with
 *   its own paper's maximum.
 *
 * The server page has already seeded the same cache keys, so on a cold load
 * these resolve from the hydrated payload instead of refetching.
 */
export function useAnalyticsData({
  scope,
  filters,
  enabled = true,
}: {
  scope: DashboardScope;
  filters: Filters;
  enabled?: boolean;
}) {
  const { activeTarget, activeShape } = useExamScope();
  // One debounce for the whole workspace: instant on mount, 350 ms behind a
  // typing burst. Seeded instantly so the first load is never delayed.
  const debouncedFilters = useDebouncedValue(filters, 350);

  const analyticsQuery = useQuery(
    analyticsQueryOptions(scope, debouncedFilters, { enabled }),
  );
  const allAttemptsQuery = useQuery(allAttemptsQueryOptions);

  const target = activeTarget?.marks ?? null;
  const targetMaxScore =
    activeTarget?.maxScore ??
    (activeShape
      ? activeShape.subjects
          .filter((s) => !s.qualifying)
          .reduce((sum, s) => sum + s.questions, 0) * activeShape.marking.correct
      : null);

  const analytics: Analytics | null = analyticsQuery.data ?? null;
  const allAttempts = allAttemptsQuery.data ?? EMPTY_ATTEMPTS;

  const error =
    (enabled ? analyticsQuery.error?.message : undefined) ??
    allAttemptsQuery.error?.message ??
    "";
  const loading = (enabled && analyticsQuery.isPending) || allAttemptsQuery.isPending;

  // A plain object, not a useMemo: the returned fields are primitives and the
  // payload object itself, so memoizing the wrapper buys nothing while forcing
  // a dependency list that is easy to get wrong (it previously flagged two
  // derived `isPending` reads). Callers memo what they actually pass down.
  return {
    analytics,
    allAttempts,
    target,
    targetMaxScore,
    loading,
    error,
    refetch: () => {
      void analyticsQuery.refetch();
      void allAttemptsQuery.refetch();
    },
  };
}
