"use client";
import { useRouter } from "next/navigation";
import { usePlanData } from "@/components/use-plan-data";
import { useAllAttempts } from "@/components/shared/use-analytics-data";
import { useUiStore } from "@/stores/ui-store";
import { CalendarView } from "./calendar-view";

/**
 * Client shell for `/calendar`.
 *
 * The calendar is a unified ledger over three layers — plan assignments,
 * personal dated tasks, and logged attempts. The attempts come from the shared
 * query; the plan and personal tasks come from `usePlanData`, which is the one
 * merged payload every plan surface reads.
 */
export function CalendarRoute() {
  const router = useRouter();
  const planApi = usePlanData();
  const attempts = useAllAttempts();
  const setPlannerDate = useUiStore((s) => s.setPlannerDate);

  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <CalendarView
        planApi={planApi}
        attempts={attempts}
        onAddMock={(date, task, returnTo) => {
          setPlannerDate(date);
          const params = new URLSearchParams({
            date,
            returnTo: returnTo ?? `/plan/${date}`,
          });
          if (task) params.set("name", task.name);
          router.push(`/add?${params.toString()}`);
        }}
        onOpenAttempt={(attempt) => useUiStore.getState().openAttempt(attempt.id)}
        onSelectedDateChange={setPlannerDate}
      />
    </div>
  );
}
