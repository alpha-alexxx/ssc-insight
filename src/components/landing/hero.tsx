import { HeroArt } from "./hero-art";
import { HeroCtas } from "./hero-ctas";
import { TypedLine } from "./atoms";
import { LANDING_SUMMARY, LANDING_TARGET } from "./fixtures";
import type { LandingPlanData } from "./plan-facts";
import { EYEBROW } from "./section";

/**
 * The hero. The copy column is a server component, so the headline is painted
 * and readable before any JavaScript runs — the LCP never waits on hydration.
 * The art column and the CTA cluster are the two client islands.
 *
 * The terminal card prints two commands drawn from the same fixture numbers the
 * rest of the page shows — the plan day from the real study plan, the latest
 * score from the real scoring engine — so no hero line is hand-typed.
 */
export function Hero({
  authAvailable,
  plan,
}: {
  authAvailable: boolean;
  plan: LandingPlanData;
}) {
  const sample = plan.sampleDay;
  const dayLine = `day ${sample.day}/50 · ${sample.phaseName.toLowerCase()} · ${sample.tasks.length} assignments`;
  const gap = LANDING_TARGET - LANDING_SUMMARY.latestScore;
  const mockLine = `last mock ${LANDING_SUMMARY.latestScore}/${LANDING_SUMMARY.latestMax} · target ${LANDING_TARGET} · gap ${gap >= 0 ? "−" : "+"}${Math.abs(gap)}`;

  return (
    <section
      id="intro"
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* A soft brand wash behind the composition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-44 size-[34rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="max-w-xl">
          <p className={`${EYEBROW} flex items-center gap-2.5`}>
            <span aria-hidden="true" className="h-px w-6 bg-primary" />
            SSC CGL Tier 2 · Mock tracker
          </p>

          <h1
            id="hero-title"
            className="mt-5 max-w-[17ch] text-balance font-serif text-[clamp(2.125rem,4vw,3.125rem)] font-[450] leading-[1.06] tracking-[-0.03em] text-foreground"
          >
            Your mocks are data.
            <span className="mt-1 block text-primary">
              Make them mean something.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            SSC Insight is a private tracker for SSC CGL Tier 2. Log every
            full, sectional and subject mock, and read the trend, the gap to
            your target, and the next test on a 50-day plan.
          </p>

          {/* The product in one sentence: a terminal printing the day's
              ledger. Every figure is derived above from the plan and the
              scoring fixtures — nothing here is typed by hand. */}
          <div
            aria-hidden="true"
            className="mt-7 max-w-md rounded-xl bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <p>
              <span className="mr-1.5 text-primary">$</span>
              <TypedLine text={dayLine} />
            </p>
            <p className="mt-1 text-muted-foreground">
              <span className="mr-1.5 text-primary">$</span>
              <TypedLine text={mockLine} />
            </p>
          </div>
          <p className="sr-only">
            {dayLine}. {mockLine}.
          </p>

          <HeroCtas authAvailable={authAvailable} />

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>Private account</span>
            <span aria-hidden="true">·</span>
            <span>Google or email sign-in</span>
            <span aria-hidden="true">·</span>
            <span>Export everything, anytime</span>
          </p>
        </div>

        <div className="min-w-0">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}
