import { Skeleton } from "@/components/skeleton";

/** Loading skeleton for calendar — mirrors the route's real geometry:
 * a page header, the four-cell metric strip, the toolbar, then the month
 * surface (weekday head + six whole weeks of day cells). */
export default function CalendarLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1560px]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only" role="status">
        Loading…
      </span>
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <Skeleton width={192} height={28} />
          <Skeleton className="mt-2 max-w-full" width={288} height={12} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={104} height={32} />
          <Skeleton width={88} height={32} />
        </div>
      </div>
      {/* The calendar's divided metric strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} shape="block" height={92} className="rounded-2xl" />
        ))}
      </div>
      {/* The toolbar: period title, then movement + mode + layers */}
      <div className="mb-4 border-b border-border pb-3">
        <Skeleton width={224} height={24} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Skeleton width={96} height={28} className="rounded-full" />
          <Skeleton width={72} height={28} className="rounded-full" />
          <Skeleton width={264} height={28} className="rounded-full" />
        </div>
      </div>
      {/* The month surface */}
      <div className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full sm:h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}
