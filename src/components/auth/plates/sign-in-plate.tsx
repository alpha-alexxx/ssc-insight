import {
  LANDING_SUMMARY,
  LANDING_TARGET,
} from "@/components/landing/fixtures";
import { shortDate } from "@/lib/format";

/**
 * The sign-in plate: the ledger reading.
 *
 * A quiet token-art composition over the paper tokens — the full-mock trend
 * drawn as ink bars with an accent target rule, and the ledger facts set as
 * editorial figures. Every number derives through the app's own scoring and
 * analytics code (`landing/fixtures.ts` → `totals()`/`analyze()`), so the art
 * cannot claim a figure the product cannot produce.
 *
 * The plate never remaps semantic tokens; it reads them, in every palette ×
 * style × light/dark combination.
 */

export function SignInPlateArt() {
  const trend = LANDING_SUMMARY.trend;
  const latest = trend.at(-1)!;
  const average = LANDING_SUMMARY.averagePercentage;
  const target = LANDING_TARGET;

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-10">
      <div>
        <p className="auth-plate-title">
          The trend, the target, the gap —
          <span className="block">from one saved result.</span>
        </p>
      </div>

      {/* Trend bars: percentage per saved full mock, the real analytics
          projection, with the target rule across. Columns carry the definite
          height (h-full of the h-28 row) so each bar's percentage resolves. */}
      <figure className="m-0" aria-hidden="true">
        <div className="relative flex h-28 gap-2">
          {trend.map((point, index) => (
            <div
              key={point.key}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <span
                className="w-full rounded-t-[3px] bg-[var(--plate-fg)]"
                style={{
                  height: `${Math.max(8, point.percentage)}%`,
                  opacity: 0.45 + 0.55 * (index / (trend.length - 1)),
                }}
              />
            </div>
          ))}
          {/* the target rule at its true height (320/390) */}
          <div
            className="pointer-events-none absolute inset-x-0 h-px bg-accent"
            style={{ bottom: `${(target / 390) * 100}%` }}
          />
        </div>
        <figcaption className="mt-3 flex justify-between text-[0.6875rem] text-[var(--plate-muted)] tabular-nums">
          <span>{shortDate(trend[0]!.date)}</span>
          <span>{shortDate(latest.date)}</span>
        </figcaption>
      </figure>

      <dl className="grid grid-cols-3 gap-x-6 border-t border-[var(--plate-rule-soft)] pt-5">
        {[
          { label: "Last mock", value: `${LANDING_SUMMARY.latestScore}` },
          { label: "Average", value: average == null ? "—" : `${Math.round(average)}%` },
          { label: "Target", value: `${target}` },
        ].map((row) => (
          <div key={row.label}>
            <dt className="auth-plate-fact-label">{row.label}</dt>
            <dd className="mt-1 font-serif text-2xl leading-none tracking-[-0.02em] tabular-nums text-[var(--plate-fg)]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-xs leading-relaxed text-[var(--plate-muted)]">
        {LANDING_SUMMARY.mockCount} saved attempts · {trend.length} full mocks ·
        target {target}/390
      </p>
    </div>
  );
}
