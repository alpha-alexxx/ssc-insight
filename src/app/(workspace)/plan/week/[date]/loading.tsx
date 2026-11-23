import { Skeleton } from "@/components/skeleton";

/** Loading skeleton for plan/week/[date] — mirrors the route's real geometry:
 * the page header with its week-stepping pills, then the seven-day schedule
 * ledger (date gutter + assignment rows + open-day control per day). */
export default function PlanWeekLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1560px]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only" role="status">
        Loading…
      </span>
      {/* Page header with prev / this day / next pills */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <Skeleton width={128} height={28} />
          <Skeleton className="mt-2 max-w-full" width={224} height={12} />
        </div>
        <div className="flex gap-1.5">
          <Skeleton width={72} height={28} className="rounded-full" />
          <Skeleton width={80} height={28} className="rounded-full" />
          <Skeleton width={72} height={28} className="rounded-full" />
        </div>
      </div>
      {/* The week's schedule: one row per day */}
      <div className="rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="divide-y divide-border">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 sm:px-6">
              <div className="w-24 shrink-0 space-y-1.5">
                <Skeleton width={56} height={12} />
                <Skeleton width={72} height={20} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton width={96} height={12} />
                <Skeleton width={240} height={12} />
                <Skeleton width={192} height={12} />
                <Skeleton width={160} height={2} />
              </div>
              <Skeleton
                width={96}
                height={32}
                className="shrink-0 rounded-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
