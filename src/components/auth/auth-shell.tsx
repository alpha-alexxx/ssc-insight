import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrowserFrame } from "@/components/landing/mockups/browser-frame";
import { DashboardScreen } from "@/components/landing/mockups/dashboard-screen";
import { LANDING_PLAN } from "@/components/landing/plan-data";

/**
 * The split-ledger chrome for the auth pages: a full-height ink plate
 * carrying a real product miniature (the same token-driven mockups the
 * landing shows — never a screenshot) beside the task's form on paper.
 *
 * The plate is the page's one signature element; the form side stays quiet
 * and left-aligned. On phones the plate is hidden and the form leads, so
 * the task is never behind a scroll. Facts on the plate come from the same
 * plan/scoring data the landing uses — nothing here is hand-typed.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* The plate — hidden on phones, the signature on desktop */}
      <div
        aria-hidden="true"
        className="plate relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14"
      >
        <p className="plate-label">Your preparation, in perspective.</p>

        <div className="relative mx-auto w-full max-w-[34rem] py-8">
          <BrowserFrame url="ssc insight · dashboard">
            <DashboardScreen />
          </BrowserFrame>
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-[var(--plate-muted)]">
            One saved mock, four readings — trend, subjects, target gap and the
            next test. The dashed line is your target.
          </p>
        </div>

        <div>
          <dl className="grid grid-cols-4 gap-6 border-t border-[var(--plate-rule-soft)] pt-6">
            {[
              { value: "390", label: "marks in a paper" },
              { value: "4", label: "readings per mock" },
              { value: String(LANDING_PLAN.days.length), label: "days on the plan" },
              { value: "1", label: "file to move everything" },
            ].map((fact) => (
              <div key={fact.label}>
                <dd className="tabular-nums font-serif text-2xl leading-none tracking-[-0.02em] text-[var(--plate-fg)]">
                  {fact.value}
                </dd>
                <dt className="mt-1.5 text-[0.6875rem] leading-snug text-[var(--plate-muted)]">
                  {fact.label}
                </dt>
              </div>
            ))}
          </dl>
          <p className="mt-6 flex items-center gap-2 text-[0.6875rem] text-[var(--plate-muted)]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--accent)]" />
            It reads your mocks. It writes nothing.
          </p>
        </div>
      </div>

      {/* The task */}
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="landing-wordmark text-xl text-ink transition-opacity hover:opacity-80"
          >
            ssc<span className="text-accent">insight</span>
            <span className="text-accent">.</span>
          </Link>
          <ThemeToggle />
        </header>
        <main
          id="main-content"
          className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8"
        >
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
