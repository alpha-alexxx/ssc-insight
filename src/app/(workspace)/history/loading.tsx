import { Skeleton } from "@/components/skeleton";

/** Loading skeleton for history — mirrors the route's real geometry. */
export default function HistoryLoading() {
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
      {/* The filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton width={224} height={36} />
        <Skeleton width={128} height={36} />
        <Skeleton width={128} height={36} />
        <Skeleton width={160} height={36} />
      </div>
      {/* Rows of list results with a pagination footer */}
      <div className="rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton width={96} height={14} />
              <Skeleton className="flex-1" width={160} height={14} />
              <Skeleton width={64} height={14} />
              <Skeleton width={80} height={14} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Skeleton width={96} height={32} />
          <Skeleton width={128} height={14} />
          <Skeleton width={96} height={32} />
        </div>
      </div>
    </div>
  );
}
