import Link from "next/link";

/**
 * Not-found surface for /plan/[date].
 *
 * Reached when the route segment cannot be parsed as an IST date. A redirect
 * would be wrong here: the URL is shareable, so the visitor needs to see that
 * this exact address has no day behind it.
 */
export const metadata = {
  title: "Plan day not found · SSC Insight",
  robots: { index: false, follow: false },
};

export default function PlanDayNotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16">
      <div className="rounded-card border border-rule-soft bg-paper p-8 shadow-pop">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          404 · Plan day
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-ink">
          That date isn&apos;t a plan day
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">The address has to end in an ISO date, like /plan/2026-11-20. Nothing was changed by this visit.</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/plan"
            className="inline-flex items-center justify-center rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent-hover"
          >
            Open today&apos;s plan
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-control border border-rule-soft px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-soft"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
