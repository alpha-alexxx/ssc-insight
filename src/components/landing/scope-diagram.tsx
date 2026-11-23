import { LANDING_SCOPES, LANDING_SUMMARY } from "./fixtures";
import { subjectChartColor } from "./mockups/data-parts";
import { EYEBROW } from "./section";

/**
 * The analytical-scope diagram: one saved record fanning into four readings.
 *
 * This is the least obvious and most important idea in the product, so it gets
 * its own drawing rather than a card grid. The counts are `analyze()` output —
 * the app's own projection counts, never typed by hand.
 *
 * Deliberately static markup: the fan lines are simply drawn (the old
 * scroll-driven draw was a keyframe effect that left with the retired
 * stylesheet), so the diagram explains the core idea without depending on an
 * observer firing.
 */

const ORDER = ["full", "subject", "sectional", "all"] as const;

const NOTES: Record<(typeof ORDER)[number], string> = {
  full: "one point per saved full mock",
  subject: "one point per subject result, incl. Computer",
  sectional: "explicit sectionals + two derived per full mock",
  all: "one point per saved attempt, compared by percentage",
};

export function ScopeDiagram() {
  const source = LANDING_SUMMARY;

  return (
    <div className="relative">
      {/* The source record. */}
      <div className="mx-auto w-full max-w-sm rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="flex items-baseline justify-between gap-3">
          <p className={EYEBROW}>One saved record</p>
          <p className="tabular-nums text-[11px] text-muted-foreground">
            {source.latestScore} / {source.latestMax}
          </p>
        </div>
        <p className="mt-1.5 font-serif text-lg leading-tight tracking-[-0.02em] text-foreground">
          Testbook Full Mock 2
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          25 Oct · 130 questions · 124 min
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-2.5">
          {source.whereYouStand
            .filter((row) => row.subjectId !== "computer")
            .map((row) => (
              <div key={row.subjectId}>
                <p className="truncate text-[10px] text-muted-foreground">{row.label}</p>
                <span className="mt-1 block h-0.5 rounded-full bg-muted" aria-hidden="true">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, row.averagePercentage ?? 0))}%`,
                      background: subjectChartColor(row.subjectId),
                    }}
                  />
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Fan: one line per scope. */}
      <svg
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        className="mx-auto block h-14 w-full max-w-3xl"
        aria-hidden="true"
      >
        {ORDER.map((scope, index) => (
          <path
            key={scope}
            d={`M200 0 C200 30, ${50 + index * 100} 24, ${50 + index * 100} 64`}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Four readings of the same record. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ORDER.map((scope) => {
          const data = LANDING_SCOPES[scope];
          return (
            <div
              key={scope}
              className="rounded-xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <p className={EYEBROW}>{data.label}</p>
              <p className="mt-1 font-serif text-[2rem] leading-none tracking-[-0.03em] tabular-nums text-foreground">
                {data.pointCount}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {data.pointCount === 1 ? "point" : "points"}
              </p>
              <p className="mt-2 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
                {NOTES[scope]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
