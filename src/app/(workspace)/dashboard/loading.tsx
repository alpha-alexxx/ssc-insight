import { Skeleton } from "@/components/skeleton";

/** Loading skeleton for dashboard — mirrors the route's real geometry. */
export default function DashboardLoading() {
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
        <Skeleton width={128} height={36} />
      </div>
      {/* The overview metric band */}
      <Skeleton className="mb-5" height={104} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Skeleton height={208} />
          <Skeleton height={288} />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton height={160} />
          <Skeleton height={224} />
        </div>
      </div>
    </div>
  );
}
