"use client";
import { usePlanData } from "@/components/use-plan-data";
import { MyTasksView } from "./my-tasks-view";

/**
 * Client shell for `/my-tasks`.
 *
 * The task workspace reads the shared plan payload through `usePlanData` to
 * show what the schedule expects, but completing plan work stays on the plan —
 * a personal task and a plan assignment are deliberately different records.
 */
export function MyTasksRoute() {
  const planApi = usePlanData();
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 md:py-5">
      <MyTasksView planApi={planApi} />
    </div>
  );
}
