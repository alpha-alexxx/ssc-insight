"use client";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePlanData } from "@/components/use-plan-data";
import { useAiWorkspace } from "@/components/use-ai-workspace";
import { AiCoachCard } from "@/components/ai-coach-card";
import { useAnalyticsData } from "@/components/shared/use-analytics-data";
import { useUiStore } from "@/stores/ui-store";
import { DashboardView } from "./dashboard-view";

/** A stable empty filter object: a fresh `{}` per render would retrigger queries. */
const NO_FILTERS = {};

/**
 * Client shell for `/dashboard`.
 *
 * The dashboard is the one surface that reads four resources at once — the plan
 * (today's work), analytics (the "all" scope), the unfiltered attempt list (for
 * the outcome cards), and the AI coach. They live in the hooks below rather
 * than in the page, and every one of them is a query-cache read seeded by the
 * page's server prefetch.
 *
 * The dashboard's preview is deliberately a fixed cross-type read ("what did I
 * last score, and how is that moving?"), so it always asks for the `all` scope;
 * `/performance` owns the selectable scope.
 */
export function DashboardRoute() {
  const router = useRouter();
  const planApi = usePlanData();
  const ai = useAiWorkspace();
  const openAiChat = useUiStore((s) => s.openAiChat);

  // The dashboard's preview is a fixed cross-type read; it takes no record
  // filters, so the filter object is empty and stable.
  const { analytics, allAttempts, target, loading } = useAnalyticsData({
    scope: "all",
    filters: NO_FILTERS,
  });

  // The outcome cards render the attempts the analytics payload was built from,
  // newest first — not the raw list, which may include records the projection
  // excluded.
  const dashboardAttempts = useMemo(() => {
    if (!analytics) return [];
    return (analytics.sourceAttemptIds ?? [])
      .map((id) => allAttempts.find((attempt) => attempt.id === id))
      .filter((attempt): attempt is (typeof allAttempts)[number] => !!attempt)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }, [analytics, allAttempts]);

  const { open: openCoachChat, generate, insight, busy, error } = ai.coach;
  const coach = useMemo(
    () =>
      ai.aiStatus?.enabled ? (
        <AiCoachCard
          status={ai.aiStatus}
          insight={insight}
          busy={busy}
          error={error}
          onGenerate={() => void generate()}
          onOpenChat={openCoachChat}
        />
      ) : undefined,
    [ai.aiStatus, busy, error, generate, insight, openCoachChat],
  );

  const openDay = useCallback(
    (date: string) => {
      useUiStore.getState().setPlannerDate(date);
      router.push(`/plan/${date}`);
    },
    [router],
  );

  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <DashboardView
        planApi={planApi}
        analytics={analytics}
        attempts={dashboardAttempts}
        target={target}
        loading={loading}
        coach={coach}
        // The detail dialog and the add flow are places now, not modes.
        onOpenAttempt={(attempt) => useUiStore.getState().openAttempt(attempt.id)}
        onAdd={() => router.push("/add")}
        onViewAll={() => router.push("/history")}
        onOpenDay={openDay}
        onOpenPersonalAi={() => openAiChat("todos")}
      />
    </div>
  );
}
