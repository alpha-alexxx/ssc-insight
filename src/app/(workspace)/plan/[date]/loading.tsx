import { Skeleton } from "@/components/skeleton";

/** Loading skeleton for plan/[date] — mirrors the route's real geometry:
 * the day navigation pills, the hero figures, then the guided flow
 * (Today's work, habits, revision, notes) beside the desktop context rail. */
export default function PlanDayLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only" role="status">
        Loading…
      </span>
      {/* Top navigation: prev · next · calendar · week · add record */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
        <div className="col-span-2 flex gap-1 sm:col-span-1">
          <Skeleton width={88} height={36} className="rounded-full" />
          <Skeleton width={88} height={36} className="rounded-full" />
        </div>
        <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:contents">
          <Skeleton width={96} height={36} className="rounded-full" />
          <Skeleton width={72} height={36} className="rounded-full" />
          <Skeleton width={140} height={36} className="rounded-full" />
        </div>
      </div>
      {/* Hero: phase · day type · the three figures */}
      <div className="mb-6">
        <Skeleton width={224} height={12} />
        <Skeleton className="mt-2" width={128} height={40} />
        <div className="mt-3 flex flex-wrap gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="w-16">
              <Skeleton width={48} height={12} />
              <Skeleton className="mt-1" width={64} height={24} />
              <Skeleton className="mt-1.5" width={80} height={2} />
            </div>
          ))}
        </div>
      </div>
      {/* Guided flow + desktop context rail */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="flex flex-col gap-5">
          <Panel rows={5} />
          <Panel rows={4} />
        </div>
        <Panel rows={6} />
      </div>
    </div>
  );
}

/** One token-composed panel box with a heading rule and N list rows. */
function Panel({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:p-5">
      <Skeleton className="h-4 w-28" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
