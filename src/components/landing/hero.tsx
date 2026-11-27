import { AnnouncementPill } from "@/components/announcement-pill";
import { HeroArt } from "./hero-art";
import { HeroBeamStage } from "./hero-beam-stage";
import { HeroCtas } from "./hero-ctas";
import { HeroStats, type HeroStat } from "./hero-stats";
import { LANDING_SUMMARY, LANDING_TARGET } from "./fixtures";
import type { LandingPlanData } from "./plan-facts";

/**
 * The hero — a mix of two Hyperblur heroes on the house system.
 *
 *  - `hero-product`: the split composition. Copy on the left, a layered
 *    product stage on the right whose layers tilt and float in depth with the
 *    pointer (`HeroArt`), and the headline's second line painted with the
 *    accent gradient rather than flat ink.
 *  - `hero-beams`: the atmosphere. Thin beams fall from the top toward a
 *    glowing horizon arc (`HeroBeamStage`), and three figures count up on
 *    the horizon once in view (`HeroStats`).
 *  - Hairline's `AnnouncementPill` sits above the headline and opens in place
 *    into today's plan rather than sending the visitor away.
 *
 * Every figure is derived from the fixtures and the real study plan through
 * the real scoring engine — the pill's plan day, the stage and the horizon
 * all read the same numbers the product shows. Nothing here is hand-typed.
 *
 * The section is a client island tree (pill, stage, stats), but the headline,
 * copy and CTAs are still server-rendered HTML, so the page paints and reads
 * before hydration.
 */
export function Hero({
  authAvailable,
  plan,
}: {
  authAvailable: boolean;
  plan: LandingPlanData;
}) {
  const s = LANDING_SUMMARY;
  const sample = plan.sampleDay;
  const gap = LANDING_TARGET - s.latestScore;

  const stats: HeroStat[] = [
    {
      value: s.latestScore,
      outOf: s.latestMax,
      label: "Latest full mock",
    },
    {
      value: Number((s.averagePercentage ?? 0).toFixed(1)),
      percent: true,
      decimals: 1,
      label: "Full-mock average",
    },
    { value: -gap, gap: true, label: `Gap to ${LANDING_TARGET}` },
  ];

  return (
    <section
      id="intro"
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <HeroBeamStage />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-center lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="max-w-xl min-w-0">
          <AnnouncementPill
            badge="New"
            more="See the day"
            card={
              <div className="p-5">
                <p className="text-xs text-muted-foreground">
                  {sample.phaseName} · day {sample.day} of {plan.days.length}
                </p>
                <ol className="mt-3 space-y-2.5">
                  {sample.tasks.slice(0, 5).map((task) => (
                    <li key={task.name} className="flex items-baseline gap-2 text-sm">
                      <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                        {task.short}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {task.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {task.questions}q
                      </span>
                    </li>
                  ))}
                </ol>
                <a
                  href="#plan"
                  className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
                >
                  See the 50-day plan
                </a>
              </div>
            }
          >
            The 50-day plan is live
            <span className="hidden sm:inline">
              {" · "}
              {plan.taskCount} scheduled tasks
            </span>
          </AnnouncementPill>

          <h1
            id="hero-title"
            className="mt-6 max-w-[34rem] font-serif text-[clamp(2rem,3.25vw,2.5rem)] font-[450] leading-[1.08] tracking-[-0.03em] text-foreground"
          >
            Your mocks are data.
            <span className="mt-1 block bg-gradient-to-r from-foreground via-foreground/95 to-foreground/75 bg-clip-text text-transparent motion-reduce:bg-none motion-reduce:text-primary">
              Make them mean something.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            SSC Insight is a private tracker for SSC CGL Tier 2. Log every
            full, sectional and subject mock, and read the trend, the gap to
            your target, and the next test on a 50-day plan.
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

        <div className="min-w-0 lg:pr-4">
          <HeroArt />
        </div>
      </div>

      {/* The horizon: figures on the arc the beams fall toward. */}
      <div className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pb-20">
        <HeroStats stats={stats} />
      </div>
    </section>
  );
}
