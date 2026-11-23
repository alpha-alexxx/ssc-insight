import { Skeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared skeleton scaffolding for route `loading.tsx` files.
 *
 * Each route composes these primitives so its skeleton matches its own real
 * geometry — the same header, the same column count, the same chart heights —
 * instead of a generic spinner. A skeleton that does not match the resolved
 * layout replaces one jump with another, so the shapes here are deliberately
 * boring: hairline rules, page-header proportions, and panel boxes.
 */
export function RouteSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1560px]"
    >
      <span className="sr-only">Loading…</span>
      {children ?? <SkeletonHeader />}
    </div>
  );
}

/** Page header: icon tile + serif title + description + one action button. */
export function SkeletonHeader({ action = true }: { action?: boolean }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
      <div className="min-w-0">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
      </div>
      {action ? <Skeleton className="h-9 w-32" /> : null}
    </div>
  );
}

/** A bordered panel box the height of one chart or list card. */
export function SkeletonPanel({
  className,
  rows,
}: {
  className?: string;
  rows?: number;
}) {
  if (rows) {
    return (
      <div className={cn("rounded-2xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]", className)}>
        <Skeleton className="h-3.5 w-28" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("rounded-2xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]", className)}>
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}

/** The divided metric strip used by the dashboard, tasks and calendar. */
export function SkeletonMetricStrip({ cells = 4 }: { cells?: number }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-4">
      {Array.from({ length: cells }, (_, i) => (
        <div key={i} className="bg-card p-4">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-2.5 h-8 w-20" />
          <Skeleton className="mt-2 h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Filter row: search field + two selects + a date range. */
export function SkeletonFilterRow() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-40" />
    </div>
  );
}

/** Rows of list results with a pagination footer. */
export function SkeletonList({ rows = 10 }: { rows?: number }) {
  return (
    <div className="rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="space-y-0 divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-40 flex-1" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
