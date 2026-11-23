/** Mirrors the split-ledger geometry: the plate's block on lg, the form's
 * column on the right — never a bare spinner. */
export default function AuthPageLoading() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div
        aria-hidden="true"
        className="plate hidden items-center justify-center p-10 lg:flex xl:p-14"
      >
        <div className="aspect-[4/5] w-full max-w-[26rem] animate-pulse rounded-[var(--radius-panel)] bg-[var(--plate-surface)]" />
      </div>
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="h-5 w-28 animate-pulse rounded-control bg-soft" />
          <div className="size-7 animate-pulse rounded-full bg-soft" />
        </header>
        <main className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm space-y-4">
            <div className="h-8 w-44 animate-pulse rounded-control bg-soft" />
            <div className="h-4 w-60 animate-pulse rounded-control bg-soft" />
            <div className="h-11 w-full animate-pulse rounded-control bg-soft" />
            <div className="h-3 w-28 animate-pulse rounded-control bg-soft" />
            <div className="space-y-3 pt-2">
              <div className="h-10 w-full animate-pulse rounded-control bg-soft" />
              <div className="h-10 w-full animate-pulse rounded-control bg-soft" />
              <div className="h-11 w-full animate-pulse rounded-control bg-soft" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
