"use client";
import { DashboardHeader } from "./dashboard-header";
import { DashboardView } from "./dashboard-view";
import type { usePlanData } from "@/components/use-plan-data";
import type { PlanWithToday } from "@/components/plan/dashboard-plan-sections";
import type { Analytics } from "@/lib/analytics";
import type { Attempt } from "@/lib/domain";

/**
 * Dashboard chrome shell: the one page-specific header block (title, meta,
 * clock, write actions) plus the dashboard content. Mounted only when
 * `view === "dashboard"`; every other workspace route keeps the shared
 * `AppFrame` header. Sidebar and top bar stay shared — this shell never
 * touches navigation, only the dashboard's own content surface.
 */
export function DashboardShell({
  planApi,
  analytics,
  attempts,
  target,
  loading,
  coach,
  onOpenAttempt,
  onAdd,
  onAddWithAi,
  onOpenPersonalAi,
  onViewAll,
  onOpenDay,
}: {
  planApi: ReturnType<typeof usePlanData>;
  analytics: Analytics | null;
  attempts: Attempt[];
  target: number | null;
  loading: boolean;
  coach?: React.ReactNode;
  onOpenAttempt: (attempt: Attempt) => void;
  onAdd: () => void;
  /** Opens the shell AI chat on the Log-a-mock tab. */
  onAddWithAi: () => void;
  /** Opens the shell AI chat on the Plan-todos tab. */
  onOpenPersonalAi: () => void;
  onViewAll: () => void;
  onOpenDay: (date: string) => void;
}) {
  const plan = planApi.plan as PlanWithToday | null;

  return (
    <>
      <DashboardHeader plan={plan} onAdd={onAdd} onAddWithAi={onAddWithAi} />
      <DashboardView
        planApi={planApi}
        analytics={analytics}
        attempts={attempts}
        target={target}
        loading={loading}
        coach={coach}
        onOpenAttempt={onOpenAttempt}
        onAdd={onAdd}
        onViewAll={onViewAll}
        onOpenDay={onOpenDay}
        onOpenPersonalAi={onOpenPersonalAi}
      />
    </>
  );
}
