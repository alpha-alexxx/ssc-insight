"use client";
import { useRouter } from "next/navigation";
import { usePlanData } from "@/components/use-plan-data";
import { useUiStore } from "@/stores/ui-store";
import { PlanWeekView } from "./plan-week-view";

/**
 * Client shell for `/plan/week/[date]`.
 *
 * The week is a real address, not a mode inside the day page, so the date
 * segment decides the range and a shared link restores it exactly.
 */
export function PlanWeekRoute({ date }: { date: string }) {
  const router = useRouter();
  const planApi = usePlanData();

  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 md:py-5">
      <PlanWeekView
        date={date}
        planApi={planApi}
        onOpenDay={(next) => {
          useUiStore.getState().setPlannerDate(next);
          router.push(`/plan/${next}`);
        }}
      />
    </div>
  );
}
