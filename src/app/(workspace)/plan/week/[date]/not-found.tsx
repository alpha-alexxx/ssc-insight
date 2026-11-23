import Link from "next/link";

/**
 * Not-found surface for /plan/week/[date].
 *
 * Reached when the route segment cannot be parsed as an IST date. A redirect
 * would be wrong here: the URL is shareable, so the visitor needs to see that
 * this exact address has no day behind it.
 *
 * Hairline rebuild: token-composed card (rounded-2xl bg-card + inset
 * hairline border) and token-styled link pills.
 */
export const metadata = {
  title: "Plan day not found · SSC Insight",
  robots: { index: false, follow: false },
};

export default function PlanWeekNotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16">
      <div className="rounded-2xl bg-card p-8 shadow-[inset_0_0_0_1px_var(--border)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          404 · Plan day
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-foreground">
          That date isn&apos;t a plan day
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">The address has to end in an ISO date, like /plan/week/2026-11-20. Nothing was changed by this visit.</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/plan"
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open today&apos;s plan
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-full px-5 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
