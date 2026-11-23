import { Skeleton } from "@/components/skeleton";

/** Loading skeleton for my-tasks — mirrors the route's real geometry: the page
 * header, the overview metric strip, the list column (tabs, quick-add pill,
 * toolbar, task rows) and the rail (plan, calendar, groups). */
export default function MytasksLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1560px] @container/mt-page"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only" role="status">
        Loading…
      </span>
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <Skeleton width={160} height={28} />
          <Skeleton className="mt-2 max-w-full" width={288} height={12} />
        </div>
        <Skeleton width={128} height={36} />
      </div>
      {/* Overview strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, cell) => (
          <div
            key={cell}
            className="rounded-2xl bg-card p-3 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <Skeleton width={72} height={11} />
            <Skeleton className="mt-1.5" width={48} height={24} />
            <Skeleton className="mt-1" width={96} height={11} />
            <Skeleton className="mt-2" height={2} />
          </div>
        ))}
      </div>
      {/* List column + rail */}
      <div className="mt-5 grid items-start gap-5 @5xl/mt-page:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="flex flex-col gap-3">
          {/* View tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <Skeleton width={64} height={24} />
            <Skeleton width={72} height={24} />
            <Skeleton width={48} height={24} />
          </div>
          {/* Quick-add pill */}
          <Skeleton className="rounded-full" height={44} />
          {/* Toolbar row */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="min-w-0 flex-1 basis-52" height={36} />
            <Skeleton width={88} height={32} />
            <Skeleton width={72} height={32} />
          </div>
          {/* Task rows */}
          <div className="rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }, (_, row) => (
                <div key={row} className="flex items-start gap-3 px-3 py-3">
                  <Skeleton shape="circle" width={16} />
                  <div className="min-w-0 flex-1">
                    <Skeleton width={220} height={14} />
                    <Skeleton className="mt-1.5" width={160} height={11} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Rail: plan, calendar, groups */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
            <Skeleton width={96} height={20} />
            <Skeleton className="mt-2" width={128} height={12} />
            <Skeleton className="mt-3" height={64} />
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
            <Skeleton width={128} height={20} />
            <Skeleton className="mt-3" height={168} />
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
            <Skeleton width={72} height={20} />
            <Skeleton className="mt-3" width={128} height={12} />
            <Skeleton className="mt-2" width={104} height={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
