"use client";
import { useRouter } from "next/navigation";
import { usePlanData } from "@/components/use-plan-data";
import { useAllAttempts } from "@/components/shared/use-analytics-data";
import { useUiStore } from "@/stores/ui-store";
import { PlanDayView } from "./plan-day-view";

/**
 * Client shell for `/plan/[date]`.
 *
 * The date segment is authoritative for this view: it comes from the URL, not
 * from the shared planner selection, so a deep link always renders the day it
 * names. Selecting another day elsewhere in the app sets the store and
 * navigates here, which is why the store exists at all.
 */
export function PlanDayRoute({ date }: { date: string }) {
  const router = useRouter();
  const planApi = usePlanData();
  const attempts = useAllAttempts();

  /** Planner → Add Mock. The attempt date is prefilled but stays editable. */
  const addMockForDate = (day: string, task?: { name: string }) => {
    useUiStore.getState().setPlannerDate(day);
    const params = new URLSearchParams({ date: day, returnTo: `/plan/${day}` });
    if (task) params.set("name", task.name);
    router.push(`/add?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <PlanDayView
        date={date}
        planApi={planApi}
        attempts={attempts}
        onAddMock={addMockForDate}
        onOpenAttempt={(attempt) => useUiStore.getState().openAttempt(attempt.id)}
      />
    </div>
  );
}
